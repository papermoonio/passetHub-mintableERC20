import hre from "hardhat";
import { expect } from "chai";
import { parseEther } from "ethers";

describe("MintableERC20", () => {
    let token: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    const initialSupply = hre.ethers.parseUnits("100000", 18);
    const mintAmount = hre.ethers.parseUnits("100", 18);

    beforeEach(async () => {
        [owner, addr1] = await hre.ethers.getSigners();
        // addr1 = hre.ethers.Wallet.createRandom(hre.ethers.getDefaultProvider());
        addr2 = hre.ethers.Wallet.createRandom(hre.ethers.getDefaultProvider());

        const MintableERC20 = await hre.ethers.getContractFactory("MintableERC20");
        token = await MintableERC20.deploy("My Mintable Token", "MMT");
        await token.waitForDeployment();

        const transfer1 = {
            to: addr1,
            value: parseEther("0.1")
        }
        const txResponse1 = await owner.sendTransaction(transfer1)
        await txResponse1.wait();

        const transfer2 = {
            to: addr1,
            value: parseEther("0.1")
        }
        const txResponse2 = await owner.sendTransaction(transfer2)
        await txResponse2.wait();
    });

    it("assigns initial supply to the deployer", async () => {
        const balance = await token.balanceOf(owner.address);
        expect(balance).to.equal(initialSupply);
    });

    it("allows any user to mint tokens for the first time", async () => {
        await token.connect(addr1).mintToken();
        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(mintAmount);
    });

    it("updates the last mint time for a user after minting", async () => {
        await token.connect(addr1).mintToken();
        const lastMint = await token.lastMintTime(addr1.address);

        // Get the timestamp of the latest block
        const latestBlock = await hre.ethers.provider.getBlock("latest");
        const blockTime = latestBlock!.timestamp;

        expect(lastMint).to.equal(blockTime);
    });

    it("rejects minting if the interval has not passed", async () => {
        await token.connect(addr1).mintToken();
        await expect(token.connect(addr1).mintToken())
            .to.be.revertedWith("You need to wait an hour between mints");
    });

    it("allows minting again after the interval has passed", async () => {
        await token.connect(addr1).mintToken();

        // can't control the block number, use zero interval to test it
        const newInterval = 0;
        await token.setInterval(newInterval);

        await expect(token.connect(addr1).mintToken()).to.not.be.reverted;
        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(mintAmount * 2n);

        const defaultInterval = 7200;
        await token.setInterval(newInterval);
    });

    it("allows the owner to mint a custom amount to any address", async () => {
        const customAmount = hre.ethers.parseUnits("5000", 18);
        await token.ownerMint(addr2.address, customAmount);
        const balance = await token.balanceOf(addr2.address);
        expect(balance).to.equal(customAmount);
    });

    it("rejects ownerMint calls from non-owners", async () => {
        const customAmount = hre.ethers.parseUnits("1000", 18);
        await expect(token.connect(addr1).ownerMint(addr2.address, customAmount))
            .to.be.revertedWith("Not owner");
    });

    it("correctly reports if a user can mint", async () => {
        expect(await token.canMint(addr1.address)).to.be.true;
        await token.connect(addr1).mintToken();
        expect(await token.canMint(addr1.address)).to.be.false;

        // can't control the block number, use zero interval to test it
        const newInterval = 0;
        await token.setInterval(newInterval);

        expect(await token.canMint(addr1.address)).to.be.true;

        const defaultInterval = 7200;
        await token.setInterval(newInterval);
    });

    it("allows the owner to set a new interval", async () => {
        const newInterval = 7200; // 2 hours
        await token.setInterval(newInterval);
        expect(await token.interval()).to.equal(newInterval);
    });

    it("rejects interval changes from non-owners", async () => {
        const newInterval = 7200;
        await expect(token.connect(addr1).setInterval(newInterval))
            .to.be.revertedWith("Not owner");
    });
});