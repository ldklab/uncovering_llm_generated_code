import { Address4 } from './ipv4';
import { Address6 } from './ipv6';
export declare function isInSubnet(this: Address4 | Address6, address: Address4 | Address6): boolean;
export declare function isCorrect(defaultBits: number): (this: Address4 | Address6) => boolean;
