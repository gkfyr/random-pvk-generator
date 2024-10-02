import { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <main>
      <div className="mx-auto w-[800px] h-screen bg-teal-300">
        <header>Random key generator!</header>
        <div className="flex w-full justify-between">
          <div>public key</div>
          <div>private key</div>

          <div>ETH :amount</div>
        </div>
      </div>
    </main>
  );
};

export default Home;
