import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  AddCartItemDto,
  CheckoutDto,
  CreateCustomerDto,
  UpdateCartItemDto,
  UpdateOrderStatusDto,
} from './store.dto';
import { StoreService } from './store.service';

@Controller()
export class StoreController {
  constructor(private readonly store: StoreService) {}

  @Get('customers')
  listCustomers() {
    return this.store.listCustomers();
  }

  @Post('customers')
  createCustomer(@Body() body: CreateCustomerDto) {
    return this.store.createCustomer(body);
  }

  @Get('customers/:customerId/cart')
  getCart(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.store.getCart(customerId);
  }

  @Post('customers/:customerId/cart/items')
  addCartItem(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() body: AddCartItemDto,
  ) {
    return this.store.addCartItem(customerId, body);
  }

  @Patch('customers/:customerId/cart/items/:itemId')
  updateCartItem(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.store.updateCartItem(customerId, itemId, body);
  }

  @Delete('customers/:customerId/cart/items/:itemId')
  removeCartItem(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.store.removeCartItem(customerId, itemId);
  }

  @Post('customers/:customerId/checkout')
  checkout(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() body: CheckoutDto,
  ) {
    return this.store.checkout(customerId, body);
  }

  @Get('orders')
  listOrders(@Query('customerId') customerId?: string) {
    return this.store.listOrders(customerId ? Number(customerId) : undefined);
  }

  @Get('orders/:id')
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.store.getOrder(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.store.updateOrderStatus(id, body.status);
  }
}