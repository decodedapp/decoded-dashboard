import { convertKeysToSnakeCase } from "@/utils/util";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { generateRandomness, generateNonce } from "@mysten/zklogin";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import axios from "axios";

/**
 * @class NetworkManager
 * @description Singleton class for network management
 */
export class NetworkManager {
  private static instance: NetworkManager;
  private readonly config: {
    /**
     * @property {string} db - Database endpoint root URL
     */
    db: string;
    /**
     * @property {string} auth_client_id - Google auth client ID
     */
    auth_client_id: string;
    /**
     * @property {string} redirect_uri - Google redirect URI
     */
    redirect_uri: string;
  };

  private constructor() {
    const is_prod = process.env.NODE_ENV === "production";
    if (is_prod) {
      if (process.env.NEXT_PUBLIC_DB_ENDPOINT === undefined) {
        throw new Error("Environment variable is undefined");
      }
    } else {
      if (process.env.NEXT_PUBLIC_LOCAL_DB_ENDPOINT === undefined) {
        throw new Error("Environment variable is undefined");
      }
    }
    if (
      process.env.NEXT_PUBLIC_AUTH_CLIENT_ID === undefined ||
      process.env.NEXT_PUBLIC_REDIRECT_URI === undefined
    ) {
      throw new Error("Environment variable is undefined");
    }
    this.config = {
      db: is_prod
        ? process.env.NEXT_PUBLIC_DB_ENDPOINT!
        : process.env.NEXT_PUBLIC_LOCAL_DB_ENDPOINT!,
      auth_client_id: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    };
  }

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  public async request(
    path: string,
    method: string,
    data: any = null,
    access_token: string | null = null
  ) {
    try {
      const convertedData = convertKeysToSnakeCase(data);
      const url = `${this.config.db}/${path}`;
      const headers: any = {
        "Content-Type": "application/json",
      };
      if (access_token) {
        headers["Authorization"] = `Bearer ${access_token}`;
      }
      const res = await axios.request({
        url,
        method,
        data: convertedData,
        headers,
        maxRedirects: 0,
      });
      return res.data;
    } catch (e) {
      console.error("Request error details:", e);
      throw new Error("Error on request => " + e);
    }
  }

  public async openIdConnectUrl(): Promise<{
    sk: string;
    randomness: string;
    exp: number;
    url: string;
  }> {
    try {
      const epk = Ed25519Keypair.generate();
      const randomness = generateRandomness();
      const rpcUrl = getFullnodeUrl("devnet");
      const suiClient = new SuiClient({
        url: rpcUrl,
      });
      const suiSysState = await suiClient.getLatestSuiSystemState();
      const currentEpoch = suiSysState.epoch;
      let maxEpoch: number = parseInt(currentEpoch) + 10;
      const nonce = generateNonce(epk.getPublicKey(), maxEpoch, randomness);
      const params = new URLSearchParams({
        client_id: this.config.auth_client_id,
        redirect_uri: this.config.redirect_uri,
        response_type: "id_token",
        scope: "openid",
        nonce: nonce,
      });
      const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      return {
        sk: epk.getSecretKey(),
        randomness: randomness,
        exp: maxEpoch,
        url: url,
      };
    } catch (err) {
      throw new Error("Error on fetching nonce => " + err);
    }
  }
}

export const networkManager = NetworkManager.getInstance();
