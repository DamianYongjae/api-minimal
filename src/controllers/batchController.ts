import { Request, Response } from "express";

export default {
  test: async (req: Request, res: Response) => {
    return res.end();
  }
};
