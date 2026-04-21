import { NextResponse } from "next/server";
import * as StellarSdk from "@stellar/stellar-sdk";

const DEPLOYED_CONTRACT_ID =
  "CAIJY7YRYSZX3JTDMRF35A4QPTRHSMAL3P3GDFKQ5QOBIOTEZSRDI3WW";
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export async function GET() {
  try {
    const server = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL);
    const contract = new StellarSdk.Contract(DEPLOYED_CONTRACT_ID);

    // Create a dummy account for read-only simulation
    const dummyAccount = new StellarSdk.Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0"
    );

    // Get status
    const statusTx = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("get_status"))
      .setTimeout(30)
      .build();

    const statusResult = await server.simulateTransaction(statusTx);

    let status = "Unknown";
    if (
      StellarSdk.SorobanRpc.Api.isSimulationSuccess(statusResult) &&
      statusResult.result
    ) {
      status = StellarSdk.scValToNative(statusResult.result.retval);
    }

    // Get milestones
    const milestonesTx = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("get_milestones"))
      .setTimeout(30)
      .build();

    const milestonesResult = await server.simulateTransaction(milestonesTx);

    let milestones = { planting: false, midCrop: false, delivery: false };
    if (
      StellarSdk.SorobanRpc.Api.isSimulationSuccess(milestonesResult) &&
      milestonesResult.result
    ) {
      const [planting, midCrop, delivery] = StellarSdk.scValToNative(
        milestonesResult.result.retval
      ) as [boolean, boolean, boolean];
      milestones = { planting, midCrop, delivery };
    }

    // Get total
    const totalTx = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("get_total"))
      .setTimeout(30)
      .build();

    const totalResult = await server.simulateTransaction(totalTx);

    let total = 0;
    if (
      StellarSdk.SorobanRpc.Api.isSimulationSuccess(totalResult) &&
      totalResult.result
    ) {
      total = Number(StellarSdk.scValToNative(totalResult.result.retval)) / 10_000_000;
    }

    return NextResponse.json({
      contractId: DEPLOYED_CONTRACT_ID,
      status,
      milestones,
      total,
      network: "testnet",
      explorerUrl: `https://stellar.expert/explorer/testnet/contract/${DEPLOYED_CONTRACT_ID}`,
    });
  } catch (error) {
    console.error("Failed to fetch contract status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch contract status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
