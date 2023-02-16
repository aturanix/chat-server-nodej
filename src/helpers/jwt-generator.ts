import { randomBytes } from "crypto";
import * as jwt from "jsonwebtoken";

export class JwtGenerator {
  private readonly _secret: Buffer;

  public constructor() {
    this._secret = randomBytes(32);
  }

  public create(id: number): string {
    const timestamp = (Date.now() / 1000) | 0;
    return jwt.sign(
      { sub: id, iat: timestamp, exp: timestamp + 60 * 60 * 24 * 7 },
      this._secret
    );
  }

  public validate(token: string): number | undefined {
    try {
      const payload = jwt.verify(token, this._secret);
      if (typeof payload !== "string" && typeof payload.sub !== "undefined") {
        return parseInt(payload.sub, 10);
      }
    } catch {
      return undefined;
    }

    return undefined;
  }
}
