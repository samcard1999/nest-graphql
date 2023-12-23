import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from 'src/auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Injectable()
export class UsersService {

  private logger = new Logger('UsersService')

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async create( signupInput: SignupInput ) :Promise<User> {

    try {
      const newUser =this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10)
      });

      return await this.usersRepository.save( newUser )
      
    } catch (error) {
      this.handleDBErrors(error);
    }
  

  }

  async findAll( validRoles : ValidRoles[] ):Promise<User[]> {


    if(validRoles.length===0 ) return  await this.usersRepository.find({
      //No es necesario porque tenemos lazy en true en los argumentos de la propiedad lastupdatedby
      // relations:{
      //   lastUpdateBy : true
      // }
    });
   
    return this.usersRepository.createQueryBuilder()
    .andWhere('ARRAY[roles] && ARRAY[:...roles]')
    .setParameter('roles', validRoles)
    .getMany();

   
  }

   async findOneByEmail(email: string): Promise<User> {
   try {
    return await this.usersRepository.findOneByOrFail({email})
   } catch (error) {
    throw new NotFoundException( `${ email } not found.`);
   }
  }


  async findOneById(id: string): Promise<User> {
    try {
     return await this.usersRepository.findOneByOrFail({id})
    } catch (error) {
     throw new NotFoundException( `${ id } not found.`);
    }
   }
 

 async  update(
  adminUser: User,
  updateUserInput: UpdateUserInput
  ): Promise<User> {
   try {
     const user = await this.usersRepository.preload(updateUserInput);

     user.lastUpdateBy= adminUser;

     return await this.usersRepository.save( user );
   } catch (error) {
    throw new NotFoundException( `${ updateUserInput.id } not found.`);
   }
  }

  async block(id: string, user : User) :Promise<User>{
    const userToBlock = await this.findOneById(id);

    userToBlock.isActive = false;
    userToBlock.lastUpdateBy=user
    return await this.usersRepository.save(userToBlock);
  }

private handleDBErrors (error: any): never {

  

  if( error.code ==='23505'){
  throw new BadRequestException(error.detail.replace('Key',''));
  }

  this.logger.error(error);

  throw new InternalServerErrorException('Pleas check server logs')
}

}
