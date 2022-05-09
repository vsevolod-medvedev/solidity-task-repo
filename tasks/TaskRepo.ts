import { task } from "hardhat/config"

task("create-task", "Create a task")
    .addParam("account", "The account's address")
    .addParam("estimatedTime", "Estimated time in seconds")
    .setAction(async (taskArgs, hre) => {
        const taskRepoFactory = await hre.ethers.getContractFactory("TaskRepo")
        const taskRepo = await taskRepoFactory.deploy()

        const signer = await hre.ethers.getSigner(taskArgs.account)
        await taskRepo.connect(signer).createTask(taskArgs.estimatedTime)
        console.log("Task created!")
    })

task("get-task", "Get a task")
    .addParam("account", "The account's address")
    .addParam("id", "The task ID")
    .setAction(async (taskArgs, hre) => {
        const taskRepoFactory = await hre.ethers.getContractFactory("TaskRepo")
        const taskRepo = await taskRepoFactory.deploy()

        const signer = await hre.ethers.getSigner(taskArgs.account)
        return await taskRepo.connect(signer).getTask(taskArgs.id)
    })

task("list-tasks", "List tasks").setAction(async (taskArgs, hre) => {
    const taskRepoFactory = await hre.ethers.getContractFactory("TaskRepo")
    const taskRepo = await taskRepoFactory.deploy()

    return await taskRepo.listTasks()
})

task("delete-task", "Delete a task")
    .addParam("account", "The account's address")
    .addParam("id", "The task ID")
    .setAction(async (taskArgs, hre) => {
        const taskRepoFactory = await hre.ethers.getContractFactory("TaskRepo")
        const taskRepo = await taskRepoFactory.deploy()

        const signer = await hre.ethers.getSigner(taskArgs.account)
        await taskRepo.connect(signer).deleteTask(taskArgs.id)
        console.log("Task deleted!")
    })

task("complete-task", "Complete a task")
    .addParam("account", "The account's address")
    .addParam("id", "The task ID")
    .setAction(async (taskArgs, hre) => {
        const taskRepoFactory = await hre.ethers.getContractFactory("TaskRepo")
        const taskRepo = await taskRepoFactory.deploy()

        const signer = await hre.ethers.getSigner(taskArgs.account)
        await taskRepo.connect(signer).changeTaskStatus(taskArgs.id, 1)
        console.log("Task completed!")
    })
