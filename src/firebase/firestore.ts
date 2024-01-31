import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  startAt,
  DocumentData,
  Timestamp,
  where,
  Query,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Importa getAuth para obtener la instancia de autenticación
import firebaseApp from "./config";
// Asegúrate de inicializar Firestore y Auth con tu configuración de Firebase
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

interface User {
  id: string;
}

interface Template {
  name: string;
  id: string;
  content: Object;
  price: number;
  categories: Array<string>;
}

export async function getUsers() {
  try {
    console.log("Getting users...");
    const userCollection = collection(db, "users");
    const userQuery = query(userCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(userQuery);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as DocumentData),
    })) as User[];
    return users;
  } catch (e: any) {
    console.error("Error getting users: ", e);
    throw new Error(e.message);
  }
}

export async function getContracts(dateFilter?: {
  start: Timestamp;
  end: Timestamp;
}) {
  try {
    const contractsCollection = collection(db, "contracts");
    let contractsQuery: Query<DocumentData, DocumentData> = contractsCollection;

    if (dateFilter && dateFilter.start && dateFilter.end) {
      contractsQuery = query(
        contractsCollection,
        where("createdAt", ">=", dateFilter.start),
        where("createdAt", "<=", dateFilter.end)
      );
    }

    const querySnapshot = await getDocs(contractsQuery);
    const contracts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contracts;
  } catch (e: any) {
    throw new Error(e.message);
  }
}

export async function getTemplateById(id: string) {
  try {
    const templateDocRef = doc(db, "templates", id);
    const docSnap = await getDoc(templateDocRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error(`Error getting template by id -> ${id}:`, error);
    throw error;
  }
}

export async function createTemplate() {
  const id = "real_state";
  try {
    const templateData = {
      name: "REAL STATE",
      price: 80,
      category: ["SECURITY", "BUSINESS"],
      content: {
        EffectiveDate: "[Effective Date]",
        PropertyDetails: {
          Address: "[Property Address]",
          LegalDescription: "[Legal Description of the Property]",
          Type: "[Residential/Commercial/Industrial]",
          ParcelNumber: "[Parcel or Lot Number]",
        },
        Parties: {
          Seller: {
            Name: "[Seller's Name]",
            Address: "[Seller's Address]",
          },
          Buyer: {
            Name: "[Buyer's Name]",
            Address: "[Buyer's Address]",
          },
        },
        PurchasePrice: {
          TotalAmount: "[Total Purchase Price]",
          Deposit: "[Deposit Amount]",
          Balance: "[Balance Due at Closing]",
        },
        TermsOfSale: {
          InspectionPeriod: "[Inspection Period Duration]",
          ClosingDate: "[Closing Date]",
          Financing: "[Financing Terms]",
          Contingencies:
            "[Any Contingencies such as Financing, Inspection, etc.]",
        },
        Legal: {
          TitleTransfer: "[Title Transfer Details]",
          Zoning: "[Zoning Compliance Information]",
          Disclosures: "[Required Disclosures, e.g., Lead Paint, Asbestos]",
          Warranties: "[Any Warranties or Guarantees]",
        },
        ClosingCosts: {
          Responsibility: "[Party Responsible for Closing Costs]",
          EstimatedCosts: "[Estimated Closing Costs]",
        },
        Signatures: {
          Seller: {
            Signature: "",
            Name: "[Seller's Name]",
            Title: "[Title, if applicable]",
            Date: "[Date]",
          },
          Buyer: {
            Signature: "",
            Name: "[Buyer's Name]",
            Title: "[Title, if applicable]",
            Date: "[Date]",
          },
        },
      },
    };

    const templateDocRef = doc(db, "templates", id);

    await setDoc(templateDocRef, templateData);

    console.log("Template created with ID:", id);
    return { ...templateData };
  } catch (error) {
    console.error(`Error creating template with I ${id}:`, error);
    throw error;
  }
}
