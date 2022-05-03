// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/// @title The test task for iLink Academy, 2022
/// @author Vsevolod Medvedev
/// @notice Allows executing typical CRUD operations over the Task model
contract TaskRepo {
    enum Status {
        Pending,
        Completed
    }

    struct Task {
        uint256 id;
        address owner;
        uint256 createdTime;
        uint256 estimatedTimeInSeconds;
        Status status;
        bool isDeleted;
        bool isCompletedInTime;
    }

    Task[] tasks;
    mapping(address => uint256) public userToTasksCompletedInTimePercent;

    event TaskCreated(uint256 indexed id, address indexed owner, uint256 createdTime, uint256 estimatedTimeInSeconds);
    event TaskCompleted(uint256 indexed id, address indexed owner, bool indexed inTime);
    event TaskDeleted(uint256 indexed id, address indexed owner);

    modifier ownerOnly(uint256 _id) {
        require(tasks[_id].owner == msg.sender, "Only owner can modify a task");
        _;
    }

    modifier notDeleted(uint256 _id) {
        require(!tasks[_id].isDeleted, "The task was deleted previously");
        _;
    }

    modifier notStatus(uint256 _id, Status _status) {
        require(tasks[_id].status != _status, "The task already has this status");
        _;
    }

    /// @notice Create a task
    /// @param _estimatedTimeInSeconds Estimated time in seconds
    function createTask(uint256 _estimatedTimeInSeconds) external {
        uint256 id = tasks.length;
        uint256 createdTime = block.timestamp;
        Task memory task = Task(id, msg.sender, createdTime, _estimatedTimeInSeconds, Status.Pending, false, false);
        tasks.push(task);
        _updateUserToTasksCompletedInTimePercent(msg.sender);
        emit TaskCreated(task.id, task.owner, task.createdTime, task.estimatedTimeInSeconds);
    }

    function getTask(uint256 _id) external view notDeleted(_id) returns (Task memory) {
        return tasks[_id];
    }

    function listTasks() external view returns (Task[] memory) {
        uint256 size = 0;
        for (uint256 i = 0; i < tasks.length; i++) {
            if (!tasks[i].isDeleted) {
                size++;
            }
        }
        Task[] memory filtered = new Task[](size);
        uint256 j = 0;
        for (uint256 i = 0; i < tasks.length; i++) {
            if (!tasks[i].isDeleted) {
                filtered[j] = tasks[i];
                j++;
            }
        }
        return filtered;
    }

    function deleteTask(uint256 _id) external ownerOnly(_id) notDeleted(_id) {
        tasks[_id].isDeleted = true;
        _updateUserToTasksCompletedInTimePercent(msg.sender);
        emit TaskDeleted(_id, tasks[_id].owner);
    }

    function changeTaskStatus(uint256 _id, Status _status) external ownerOnly(_id) notDeleted(_id) notStatus(_id, _status) {
        Task storage task = tasks[_id];
        task.status = _status;
        if (_status == Status.Completed) {
            task.isCompletedInTime = block.timestamp <= task.createdTime + task.estimatedTimeInSeconds;
            _updateUserToTasksCompletedInTimePercent(msg.sender);
            emit TaskCompleted(_id, task.owner, task.isCompletedInTime);
        }
    }

    function _updateUserToTasksCompletedInTimePercent(address _user) private {
        uint256 inTimeCount = 0;
        uint256 completedCount = 0;
        for (uint256 i = 0; i < tasks.length; i++) {
            Task memory task = tasks[i];
            if (!task.isDeleted && task.owner == _user) {
                if (task.status == Status.Completed) {
                    completedCount++;
                }
                if (task.isCompletedInTime) {
                    inTimeCount++;
                }
            }
        }
        uint256 percent;
        if (completedCount == 0) {
            percent = 0;
        } else {
            percent = (inTimeCount * 10000) / completedCount;
        }
        userToTasksCompletedInTimePercent[_user] = percent;
    }
}
