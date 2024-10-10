// app/api/balance/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
    console.log(response.data);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching balance" }, { status: 500 });
  }
}
