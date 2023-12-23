import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateListItemInput {

@IsNumber()
@Min(0)
@IsOptional()
@Field( () => Number)
quantity: number = 0;

@IsBoolean()
@IsOptional()
@Field( () => Boolean)
completed: boolean = false;

@IsUUID()
@Field( () => ID,{ nullable: false })
listId: string;

@IsUUID()
@Field( () => ID,{ nullable: false })
itemId: string;


}
