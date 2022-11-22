import { LinkModel } from '../models';

class LinkService {
  async createLink(userId: string, link: string) {
    await LinkModel.create({
      userId: userId,
      value: link,
    });
  }

  async deleteLink(link: string) {
    await LinkModel.deleteOne({ value: link });
  }
}

export const linkService = new LinkService();
