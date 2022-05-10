import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareSigners } from "./utils/prepare"

use(waffle.solidity)

describe("TaskRepo contract tests", () => {
    beforeEach(async function () {
        const taskRepoFactory = await ethers.getContractFactory("TaskRepo")
        this.taskRepo = await taskRepoFactory.deploy()

        await prepareSigners(this)

        this.timestamp = (await ethers.provider.getBlock("latest")).timestamp
    })

    describe("As any user, I should be able to", () => {
        it("Create a task", async function () {
            await expect(this.taskRepo.connect(this.bob).createTask(10))
                .to.emit(this.taskRepo, "TaskCreated")
                .withArgs(0, this.bob.address, this.timestamp + 1, 10)
        })

        it("Get a task", async function () {
            await this.taskRepo.connect(this.bob).createTask(10)

            const task = await this.taskRepo.getTask(0)

            expect(task.id).to.equal(0)
            expect(task.owner).to.equal(this.bob.address)
            expect(task.createdTime).to.equal(this.timestamp + 1)
            expect(task.estimatedTimeInSeconds).to.equal(10)
            expect(task.status).to.equal(0)
            expect(task.isDeleted).to.equal(false)
            expect(task.isCompletedInTime).to.equal(false)
            expect(await this.taskRepo.userToTasksCompletedInTimePercent(this.bob.address)).to.equal(0)
        })

        it("List tasks", async function () {
            await this.taskRepo.connect(this.bob).createTask(10)
            await this.taskRepo.connect(this.alice).createTask(15)

            const tasks = await this.taskRepo.connect(this.carol).listTasks()

            expect(tasks.length).to.equal(2)
            expect(tasks[1].id).to.equal(1)
            expect(tasks[1].owner).to.equal(this.alice.address)
            expect(tasks[1].createdTime).to.equal(this.timestamp + 2)
            expect(tasks[1].estimatedTimeInSeconds).to.equal(15)
        })
    })

    describe("As not a task owner, I shouldn't be able to", () => {
        beforeEach(async function () {
            await this.taskRepo.connect(this.bob).createTask(10)
        })

        it("Change the task status", async function () {
            await expect(this.taskRepo.connect(this.alice).changeTaskStatus(0, 1)).to.be.revertedWith("Only owner can modify a task")
        })

        it("Delete the task", async function () {
            await expect(this.taskRepo.connect(this.alice).deleteTask(0)).to.be.revertedWith("Only owner can modify a task")
        })
    })

    describe("As a task owner, I should be able to", () => {
        beforeEach(async function () {
            await this.taskRepo.connect(this.bob).createTask(10)
        })

        it("Change the task status", async function () {
            await expect(this.taskRepo.connect(this.bob).changeTaskStatus(0, 1))
                .to.emit(this.taskRepo, "TaskCompleted")
                .withArgs(0, this.bob.address, true)

            expect(await this.taskRepo.userToTasksCompletedInTimePercent(this.bob.address)).to.equal(10000)

            await expect(this.taskRepo.connect(this.bob).changeTaskStatus(0, 1)).to.be.revertedWith("The task already has this status")
        })

        it("Delete the task", async function () {
            await expect(this.taskRepo.connect(this.bob).deleteTask(0)).to.emit(this.taskRepo, "TaskDeleted").withArgs(0, this.bob.address)
        })
    })

    describe("When a task is deleted, any user (even the owner) shouldn't be able to", () => {
        beforeEach(async function () {
            await this.taskRepo.connect(this.bob).createTask(10)
            await this.taskRepo.connect(this.alice).createTask(15)
            await this.taskRepo.connect(this.alice).deleteTask(1)
        })

        it("Get the task", async function () {
            await expect(this.taskRepo.connect(this.alice).getTask(1)).to.be.revertedWith("The task was deleted previously")
        })

        it("Find the the task in task list", async function () {
            const tasks = await this.taskRepo.connect(this.alice).listTasks()

            expect(tasks.length).to.equal(1)
            expect(tasks[0].id).to.equal(0)
        })

        it("Change the task status", async function () {
            await expect(this.taskRepo.connect(this.alice).changeTaskStatus(1, 1)).to.be.revertedWith("The task was deleted previously")
        })

        it("Delete the task", async function () {
            await expect(this.taskRepo.connect(this.alice).deleteTask(1)).to.be.revertedWith("The task was deleted previously")
        })
    })
})
