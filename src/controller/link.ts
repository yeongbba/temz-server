import { Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';
import { Links } from '../types/link';

export class LinkController {
  constructor(private linkRepository: any) {}

  createLinks = async (req: Request, res: Response) => {
    const { links } = req.body;

    const existed: Links = await this.linkRepository.findLinksByUserId((req as any).userId);
    if (existed.linkId) {
      const failure = new FailureObject(ErrorCode.DUPLICATED_VALUE, `Links already exist`, 409);
      throw failure;
    }

    const data = Links.parse({ userId: (req as any).userId, ...links });
    await this.linkRepository.createLinks(data);
    res.sendStatus(201);
  };

  updateLinks = async (req: Request, res: Response) => {
    const { links } = req.body;

    const data = Links.parse({ userId: (req as any).userId, ...links });
    const result: Links = await this.linkRepository.updateLinks(data);
    if (!result.linkId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Links not found', 404);
      throw failure;
    }
    res.sendStatus(204);
  };

  getLinks = async (req: Request, res: Response) => {
    const links: Links = await this.linkRepository.findLinksByUserId((req as any).userId);
    res.status(200).json({ links: links.toJson() });
  };
}
