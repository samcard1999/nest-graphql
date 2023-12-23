import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ItemsModule } from 'src/items/items.module';
import { ListsService } from 'src/lists/lists.service';
import { ListsModule } from 'src/lists/lists.module';

@Module({
  providers: [UsersResolver, UsersService],
  imports: [
    TypeOrmModule.forFeature([User]),
    ItemsModule,
    ListsModule
  ],
  exports:[
    TypeOrmModule,
    UsersService
  ]
})
export class UsersModule {}
