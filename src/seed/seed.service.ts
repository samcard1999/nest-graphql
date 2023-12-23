import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from 'src/lists/lists.service';
import { ListItemService } from 'src/list-item/list-item.service';

@Injectable()
export class SeedService {

    private isProd : boolean;
    constructor(

        private readonly configService : ConfigService,
       
        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(ListItem)
        private readonly listItemRepository: Repository<ListItem>,

        @InjectRepository(List)
        private readonly listRepository: Repository<List>,

        private readonly usersService: UsersService,

        private readonly itemsService: ItemsService,

        private readonly listsService :ListsService,

        private readonly listItemsService: ListItemService
        

    ) {
        this.isProd = configService.get('STATE') === 'prod';
    }

    async executeSeed (  ){

        if(this.isProd) {
            throw new UnauthorizedException(' We can not run seed in production')
        }
        //limpiar la base de datos BOrrar todo
        await this.deleteDatabase();
        // Crear usuarios 
        const user= await this.loadUsers();
        //Crear items
         await this.loadItems( user );
         const items = await  this.itemsService.findAll(user,{ limit: 15, offset: 9},{})
        //crear listas
      const list=  await this.loadList(user);
        //crear listItems
        await this.loadListItems( items, list)
        
        return true;
    }

    async deleteDatabase() {
       
        //await this.listitems
        await this.listItemRepository.createQueryBuilder()
        .delete()
        .where({})
        .execute();

        //list repository
        await this.listRepository.createQueryBuilder()
        .delete()
        .where({})
        .execute();
       
       
        //borrar items
        await this.itemsRepository.createQueryBuilder()
        .delete()
        .where({})
        .execute();
        //borrar users
        await this.usersRepository.createQueryBuilder()
        .delete()
        .where({})
        .execute();
    }

    async loadUsers () :Promise<User>{
        const users =[];
        for (const user of SEED_USERS) {
            users.push( await this.usersService.create( user ))
        }
        return users [0];
    }

     async loadItems ( user: User ) :Promise<void>{
        const itemsPromises =[];
        for (const item of SEED_ITEMS) {
    
            itemsPromises.push( this.itemsService.create(item, user) )
           
        }
        
        await Promise.all( itemsPromises );
    }

    async loadList( user: User) :Promise<List>{

        const lists = [];

        for ( const list of SEED_LISTS){
            lists.push( await this.listsService.create( list , user))
        }
        return lists[0];
        
    }

    async loadListItems( items: Item[], list: List){

        const listItems = [];

        for ( const item of items){

             this.listItemsService.create({
                quantity: Math.round( Math.random()*10),
                completed: Math.round( Math.random()*1) ===1? true: false,
                listId: list.id,
                itemId: item.id
            })
        }
       
    }
}
