import { Request, Response } from 'express';
import knex from '../database/connection';
import { Item } from '../models/Item';

export class ItemsController {
  async index(req: Request, res: Response) {
    const items = await knex('items').select('*');

    const serializedItems = items.map((item: Item) => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://192.168.0.102:3333/uploads/${item.image}`,
      };
    });

    return res.json(serializedItems);
  }
}
