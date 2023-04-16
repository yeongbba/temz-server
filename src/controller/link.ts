import { Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';
import { GeneralLinks, SocialLinks } from '../types/link';

export const THEME_MAX_COUNT = 5;

export class LinkController {
  constructor(private linkRepository: any) {}

  getSocialLinks = async (req: Request, res: Response) => {
    const links: SocialLinks = await this.linkRepository.findSocialLinksByUserId((req as any).userId);
    res.status(200).json(links.toJson());
  };

  createSocialLinks = async (req: Request, res: Response) => {
    const links = req.body;

    const existed: SocialLinks = await this.linkRepository.findSocialLinksByUserId((req as any).userId);
    if (existed.linkId) {
      const failure = new FailureObject(ErrorCode.DUPLICATED_VALUE, `Social Links already exist`, 409);
      throw failure;
    }

    const data = SocialLinks.parse({ userId: (req as any).userId, ...links });
    await this.linkRepository.createSocialLinks(data);
    res.sendStatus(201);
  };

  updateSocialLinks = async (req: Request, res: Response) => {
    const links = req.body;

    const data = SocialLinks.parse({ userId: (req as any).userId, ...links });
    const result: SocialLinks = await this.linkRepository.updateSocialLinks(data);
    if (!result.linkId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Social Links not found', 404);
      throw failure;
    }
    res.sendStatus(204);
  };

  getThemes = async (req: Request, res: Response) => {
    const themes: GeneralLinks[] = await this.linkRepository.findThemesByUserId((req as any).userId);
    res.status(200).json({ themes: themes.map((theme) => theme.toJson()) });
  };

  createGeneralLinks = async (req: Request, res: Response) => {
    const links = req.body;

    const themes: GeneralLinks[] = await this.linkRepository.findThemesByUserId((req as any).userId);
    if (themes.length >= THEME_MAX_COUNT) {
      const failure = new FailureObject(
        ErrorCode.NOT_ACCEPTABLE,
        `${THEME_MAX_COUNT} themes have already been created.`,
        406
      );
      throw failure;
    }

    const data = GeneralLinks.parse({ userId: (req as any).userId, ...links });
    await this.linkRepository.createGeneralLinks(data);
    res.sendStatus(201);
  };

  updateGeneralLinks = async (req: Request, res: Response) => {
    const links = req.body;

    const data = GeneralLinks.parse({ id: links.linkId, userId: (req as any).userId, ...links });
    const result: GeneralLinks = await this.linkRepository.updateGeneralLinks(data);
    if (!result.linkId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'General Links not found', 404);
      throw failure;
    }
    res.sendStatus(204);
  };

  removeGeneralLinks = async (req: Request, res: Response) => {
    const linkId = req.query.linkId as string;

    const result: GeneralLinks = await this.linkRepository.removeGeneralLinks(linkId);
    if (!result.linkId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'General Links not found', 404);
      throw failure;
    }
    res.sendStatus(204);
  };
}
