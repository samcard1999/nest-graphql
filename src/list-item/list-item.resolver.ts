import { Resolver, Query, Mutation, Args, Int, ResolveField } from '@nestjs/graphql';
import { ListItemService } from './list-item.service';
import { ListItem } from './entities/list-item.entity';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => ListItem)
@UseGuards(JwtAuthGuard)
export class ListItemResolver {
  constructor(private readonly listItemService: ListItemService) {}

  @Mutation(() => ListItem)
  createListItem(
    @Args('createListItemInput') createListItemInput: CreateListItemInput,
    @CurrentUser([ValidRoles.admin]) user:User,
    ) :Promise<ListItem> {
    return this.listItemService.create(createListItemInput);
  }

  // @Query(() => [ListItem], { name: 'listItem' })
  // findAll() {
  //   return this.listItemService.findAll(list, paginationArgs, searchArgs);
  // }

  @Query(() => ListItem, { name: 'listItem' })
  async findOne(@Args('id', { type: () => String  } , ParseUUIDPipe) id: string
  ) :Promise<ListItem>{
    return this.listItemService.findOne(id);
  }

  @Mutation(() => ListItem)
 async  updateListItem(
  @Args('updateListItemInput') updateListItemInput: UpdateListItemInput
  ):Promise<ListItem> {
    return await this.listItemService.update(updateListItemInput.id, updateListItemInput);
  }

  // @Mutation(() => ListItem)
  // removeListItem(@Args('id', { type: () => Int }) id: number) {
  //   return this.listItemService.remove(id);
  // }


}
