import { task } from "hardhat/config"

const TaskRepoAddress = "0xCe3b823FcDdfC3E56e6d602997B5348aB94Cf8F1"

task("create-task", "Create a task")
    .addParam("account", "The account's address")
    .addParam("estimatedTime", "Estimated time in seconds")
    .setAction(async (taskArgs, hre) => {
        const taskRepo = await hre.ethers.getContractAt("TaskRepo", TaskRepoAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        await taskRepo.connect(signer).createTask(taskArgs.estimatedTime)
        console.log("Task created!")
    })

task("get-task", "Get a task")
    .addParam("id", "The task ID")
    .setAction(async (taskArgs, hre) => {
        const taskRepo = await hre.ethers.getContractAt("TaskRepo", TaskRepoAddress)

        console.log(await taskRepo.getTask(taskArgs.id))
    })

task("list-tasks", "List tasks").setAction(async (taskArgs, hre) => {
    const taskRepo = await hre.ethers.getContractAt("TaskRepo", TaskRepoAddress)

    console.log(await taskRepo.listTasks())
})

task("delete-task", "Delete a task")
    .addParam("account", "The account's address")
    .addParam("id", "The task ID")
    .setAction(async (taskArgs, hre) => {
        const taskRepo = await hre.ethers.getContractAt("TaskRepo", TaskRepoAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        await taskRepo.connect(signer).deleteTask(taskArgs.id)
        console.log("Task deleted!")
    })

task("complete-task", "Complete a task")
    .addParam("account", "The account's address")
    .addParam("id", "The task ID")
    .setAction(async (taskArgs, hre) => {
        const taskRepo = await hre.ethers.getContractAt("TaskRepo", TaskRepoAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        await taskRepo.connect(signer).changeTaskStatus(taskArgs.id, 1)
        console.log("Task completed!")
    })

task("get-user-percent", "Get user's tasks completed in time percent")
    .addParam("account", "The account's address")
    .setAction(async (taskArgs, hre) => {
        const taskRepo = await hre.ethers.getContractAt("TaskRepo", TaskRepoAddress)

        const percent = (await taskRepo.userToTasksCompletedInTimePercent(taskArgs.account)) / 100
        console.log(`Tasks completed in time: ${percent.toFixed(2)} %`)
    })
