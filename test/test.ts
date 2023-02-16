import * as chai from "chai";
import { JwtGenerator } from "../src/helpers/jwt-generator";
import { main } from "../src/main";

describe("JwtHandler", () => {
  describe("validate()", () => {
    const jwtH1 = new JwtGenerator();
    const jwtH2 = new JwtGenerator();

    it("different handler", () => {
      const token = jwtH1.create(5);
      const token2 = jwtH2.create(5);

      chai.assert.throws(() => {
        jwtH2.validate(token);
      });

      chai.assert.throws(() => {
        jwtH1.validate(token2);
      });
    });

    it("same handler same id", () => {
      const token = jwtH1.create(5);
      chai.assert.equal(jwtH1.validate(token), 5);

      const token2 = jwtH2.create(7);
      chai.assert.equal(jwtH2.validate(token2), 7);
    });
  });
});

