import { initializeApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getAuth, Auth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  Firestore,
  getDocs,
  collection,
  doc,
  getDoc,
  DocumentReference,
  DocumentData,
  Timestamp,
  updateDoc,
  UpdateData,
  setDoc,
  WithFieldValue,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import {
  getStorage,
  FirebaseStorage,
  ref,
  StorageReference,
  listAll,
  getMetadata,
  getDownloadURL,
  UploadMetadata,
  uploadBytes,
} from "firebase/storage";
import {
  ImageInfo,
  ItemInfo,
  HoverItem,
  TaggedItem,
  ArticleInfo,
} from "@/types/model";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Singleton
export class FirebaseHelper {
  private static instance: FirebaseHelper;
  app: FirebaseApp;
  config: FirebaseOptions;
  private constructor() {
    if (
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === undefined ||
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN === undefined ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === undefined ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET === undefined ||
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID === undefined ||
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID === undefined ||
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID === undefined
    ) {
      throw new Error("Environment variable is undefined");
    }
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    this.app = initializeApp(this.config);
  }

  public static getInstance(): FirebaseHelper | never {
    if (!FirebaseHelper.instance) {
      try {
        FirebaseHelper.instance = new FirebaseHelper();
      } catch (error) {
        throw new Error(
          "Error occured while creating instance of `FirebaseHelper`"
        );
      }
    }
    return FirebaseHelper.instance;
  }

  public static app(): FirebaseApp | never {
    try {
      return this.getInstance().app;
    } catch (error) {
      throw new Error("Error occured while getting app instance");
    }
  }

  public static auth(): Auth | never {
    try {
      return getAuth(this.app());
    } catch (error) {
      throw new Error("Error occured while getting auth instance");
    }
  }

  public static async adminLogin(
    email: string,
    password: string
  ): Promise<boolean> {
    const auth = this.auth();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCredential.user.uid);
      if (userCredential.user.uid === process.env.NEXT_PUBLIC_ADMIN_UID) {
        return true;
      }
      return false;
    } catch (error) {
      console.log("Error on login!", error);
      return false;
    }
  }

  public static db(): Firestore | never {
    try {
      return getFirestore(this.app());
    } catch (error) {
      throw new Error("Error occured while getting db instance");
    }
  }

  public static storage(): FirebaseStorage | never {
    try {
      return getStorage(
        this.app(),
        `gs://${this.getInstance().config.storageBucket}`
      );
    } catch (error) {
      throw new Error("Error occured while getting storage instance");
    }
  }

  static docRef(collectionName: string, docId: string) {
    return doc(this.db(), collectionName, docId);
  }

  public static async docExists(collectionName: string, docId: string) {
    return (await this.doc(collectionName, docId)).exists();
  }

  public static async doc(collectionName: string, docId: string) {
    return await getDoc(this.docRef(collectionName, docId));
  }

  public static async docs(collectionName: string) {
    return await getDocs(collection(this.db(), collectionName));
  }

  public static async setDoc(
    collectionName: string,
    docId: string,
    data: WithFieldValue<DocumentData>
  ) {
    return await setDoc(this.docRef(collectionName, docId), data);
  }

  public static async updateDoc(
    isDocExist: boolean,
    collectionName: string,
    docId: string,
    data: UpdateData<any>
  ) {
    if (isDocExist) {
      return await updateDoc(this.docRef(collectionName, docId), data);
    } else {
      this.setDoc(collectionName, docId, data);
    }
  }

  public static async listAllStorageItems(collectionName: string) {
    return await listAll(FirebaseHelper.storageRef(collectionName));
  }

  public static async metadata(storageRef: StorageReference) {
    return await getMetadata(storageRef);
  }

  public static async downloadUrl(storageRef: StorageReference) {
    return await getDownloadURL(storageRef);
  }

  public static async uploadDataToStorage(
    path: string,
    data: Blob | ArrayBuffer | Uint8Array,
    metadata?: UploadMetadata
  ) {
    return await uploadBytes(this.storageRef(path), data, metadata);
  }

  public static currentTimestamp(): Timestamp {
    return Timestamp.fromDate(new Date());
  }

  public static async getHoverItems(docId: string): Promise<HoverItem[]> {
    try {
      const imageDoc = await this.doc("images", docId);
      if (imageDoc.exists()) {
        let imageInfo = imageDoc.data() as ImageInfo;
        try {
          const hoverItemList = await Promise.all(
            imageInfo.items?.map(async (item) => {
              const taggedItem = item as TaggedItem;
              const itemDoc = await this.doc("items", taggedItem.id);
              if (itemDoc.exists()) {
                const itemInfo = itemDoc.data() as ItemInfo;
                return {
                  pos: taggedItem.pos,
                  info: itemInfo,
                } as HoverItem;
              } else {
                return undefined;
              }
            }) || []
          );

          const res = (await Promise.all(hoverItemList)).filter(
            (item) => item !== undefined
          ) as HoverItem[];
          return res;
        } catch (error) {
          console.log(error);
          return [];
        }
      } else {
        console.log("No such document!");
        return [];
      }
    } catch (error) {
      throw new Error(`Error occured while trying to get document`);
    }
  }

  public static storageRef(points: string): StorageReference | never {
    try {
      return ref(this.storage(), points);
    } catch (error) {
      throw new Error("Error occured while getting storage reference");
    }
  }
}
