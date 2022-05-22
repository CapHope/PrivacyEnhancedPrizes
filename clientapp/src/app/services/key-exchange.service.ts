import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import * as nacl from 'tweetnacl-ts';
import { IKeyPair } from "../models/key-pair.model";


@Injectable()
export class KeyExchangeService {

  constructor(private http: HttpClient) {}

  getAlicePublicKey(): Observable<Uint8Array> {
    return this.http.get<Uint8Array>(environment.api + 'public-key');
  }

  private bob: IKeyPair = nacl.box_keyPair();

  getPublicKey(): Uint8Array {
    return this.bob.publicKey;
  }

  getOneTimeCode(): Uint8Array {
    return nacl.randomBytes(24);
  }

  decryptMessage(
    oneTimeCode: Uint8Array,
    publicKey: Uint8Array,
    cipherText: Uint8Array,
  ): string {
    let plainText = '';
    const decodedMessage = nacl.box_open(
      cipherText,
      oneTimeCode,
      publicKey,
      this.bob.secretKey,
    );
    if (decodedMessage) {
      plainText = nacl.encodeUTF8(decodedMessage);
    }
    return plainText;
  }

  encryptMessage(
    oneTimeCode: Uint8Array,
    publicKey: Uint8Array,
    plainText: string,
  ): Uint8Array {
    //Get the cipher text
    const cipherText = nacl.box(
      nacl.decodeUTF8(plainText),
      oneTimeCode,
      publicKey,
      this.bob.secretKey,
    );
    return cipherText;
  }
}
