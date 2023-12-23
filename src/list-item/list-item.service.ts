import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { InjectRepository } from '@nestjs/typeorm';
import { ListItem } from './entities/list-item.entity';
import { Repository } from 'typeorm';
import { List } from 'src/lists/entities/list.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ListItemService {

constructor( 
  @InjectRepository( ListItem)
  private readonly listsItemsRepository: Repository<ListItem>

) {}

 async  create(createListItemInput: CreateListItemInput): Promise<ListItem> {
  
  const {itemId, listId, ...rest} = createListItemInput
  
  const newListItem = this.listsItemsRepository.create( {
    ...rest,
    item: { id:itemId },
    list: { id: listId }

    });

     await this.listsItemsRepository.save( newListItem);
     return this.findOne ( newListItem.id );
  }

  async findAll( list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<ListItem[]> {
    
    const { limit, offset}= paginationArgs;
    const { search }= searchArgs;

    const queryBuilder = this.listsItemsRepository.createQueryBuilder()
    .take(limit)
    .skip(offset)
    .where('"listId" = :listId', { listId:list.id });

    if(search){
    queryBuilder.andWhere('LOWER(name) like :name', {name: `%${ search.toLowerCase() }%`});
    }
    return queryBuilder.getMany();

  }

  async findOne(id: string) : Promise<ListItem> {
   const listItem= await this.listsItemsRepository.findOneBy({id})

   if(!listItem){
    throw new NotFoundException(`List item with id: ${id} not found.`)
   }
   return listItem;

  }

  async update(id: string, updateListItemInput: UpdateListItemInput) :Promise<ListItem> {

    const { listId, itemId, ...rest}= updateListItemInput;
    const queryBuilder = this.listsItemsRepository.createQueryBuilder()
    .update()
    .set( rest )
    .where('id =:id',{ id });

    if( listId ) queryBuilder.set ({ list: { id: listId } });
    if( itemId ) queryBuilder.set ({ item: { id: itemId } });

    await queryBuilder.execute();

    return  this.findOne( id );

  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }
  async listItemsByList(list: List): Promise<number>{
    return this.listsItemsRepository.count({
      where :{
        list: {
         id : list.id
        }
      }
    
    })
  }
}
