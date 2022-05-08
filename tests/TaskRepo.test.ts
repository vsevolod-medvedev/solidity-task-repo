import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareSigners } from "./utils/prepare"

use(waffle.solidity)

describe("TaskRepo contract tests", function () {
    before(async function () {
        const taskRepoFactory = await ethers.getContractFactory("TaskRepo")
        this.taskRepo = await taskRepoFactory.deploy()

        await prepareSigners(this)

        this.timestamp = (await ethers.provider.getBlock("latest")).timestamp
    })

    describe("Transactions", function () {
        it("Should create a task", async function () {
            await expect(this.taskRepo.createTask(10))
                .to.emit(this.taskRepo, "TaskCreated")
                .withArgs(0, this.owner.address, this.timestamp + 1, 10)
        })

        it("Should get a task", async function () {
            const task = await this.taskRepo.getTask(0)

            expect(task.id).to.equal(0)
            expect(task.owner).to.equal(this.owner.address)
            expect(task.createdTime).to.equal(this.timestamp + 1)
            expect(task.estimatedTimeInSeconds).to.equal(10)
            expect(task.status).to.equal(0)
            expect(task.isDeleted).to.equal(false)
            expect(task.isCompletedInTime).to.equal(false)
        })

        it("Should list tasks", async function () {
            await this.taskRepo.createTask(15)

            const tasks = await this.taskRepo.listTasks()

            expect(tasks.length).to.equal(2)
            expect(tasks[1].id).to.equal(1)
            expect(tasks[1].createdTime).to.equal(this.timestamp + 2)
            expect(tasks[1].estimatedTimeInSeconds).to.equal(15)
        })

        it("Should delete a task", async function () {})

        it("Should change a task status", async function () {})

        // TODO: Edge cases
    })
})
