import knex from '../database/connection';
import { Request, Response, text } from 'express';

const POINTS_TABLE = 'points';

export class PointsController {
  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body;

    const trx = await knex.transaction();

    const point = {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      image: req.file.filename,
    };

    const insertedIds = await trx(POINTS_TABLE).insert(point);

    const point_id = insertedIds[0];

    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

    await trx('point_items').insert(pointItems);

    await trx.commit();

    return res.json({ id: point_id, ...point });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex(POINTS_TABLE).where('id', id).first();

    if (!point) {
      return res.status(400).json({ message: 'Point not found.' });
    }

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.0.102:3333/uploads/${point.image}`,
    };

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return res.json({ ...serializedPoint, items });
  }

  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    console.log(city, uf, items);

    const itemsArray = String(items)
      .split(',')
      .map((item) => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', itemsArray)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.0.102:3333/uploads/${point.image}`,
      };
    });

    return res.json(serializedPoints);
  }
}
