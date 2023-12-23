import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { ListItemService } from 'src/list-item/list-item.service';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(
    private readonly listsService: ListsService,
    private readonly listItemsService:ListItemService
    
    ) {}

  @Mutation(() => List,{name: 'createList1'})
  createList(
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser() user: User
    ) :Promise<List> {
      console.log('hola')
    return this.listsService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  findAll(
    @CurrentUser() user: User,
    @Args () paginationArgs: PaginationArgs,
    @Args () searchArgs: SearchArgs,
  ) :Promise<List[]> {
    return this.listsService.findAll(user, paginationArgs, searchArgs);
  }

  @Query(() => List, { name: 'list' })
  findOne(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: User
    ) :Promise<List> {
    return this.listsService.findOne(id, user );
  }

  @Mutation(() => List)
  updateList(@Args('updateListInput') updateListInput: UpdateListInput,
  @CurrentUser() user: User
  ) {
    return this.listsService.update(updateListInput.id, updateListInput, user);
  }

  @Mutation(() => List)
  removeList(@Args('id', { type: () => String }) id: string,
  @CurrentUser() user: User
  
  ): Promise<List> {

    
    return this.listsService.remove(id, user);
  }

  @ResolveField( () => [ListItem],{name: 'items'})
  async getListItems(
    @Parent( ) list: List,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,

  ): Promise<ListItem[]>{

    return this.listItemsService.findAll(list, paginationArgs, searchArgs);

  }


  @ResolveField( () => Int, {name: 'totalItems'} )
  async countListItemsByList (
    @CurrentUser([ValidRoles.user]) adminUser: User,
    @Parent() list: List
  ): Promise<number> {
    
    return this.listItemsService.listItemsByList(list);
  }

}
