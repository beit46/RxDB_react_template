import {useEffect, useState} from 'react'
import './App.css'
import {rxDB} from "./setup-rxdb.ts";
import {Task} from "./Task.model";
import {TaskCard} from "./TaskCard";
import {emptyTask} from "./emptyTask.defaults";

function App() {
    const database = rxDB();
    const [tasks, setTasks] = useState<Task[]>([])
    const handleAddTask = () => addTask(emptyTask())
    const addTask = async (task: Task) => await database.create(task.name, task.description, crypto.randomUUID())
    const updateTask = async (task: Task) =>
        await database.update(task.name ?? '', task.description ?? '', task.uuid);
    const deleteTask = async (uuid: string) => await database.delete(uuid);

    useEffect(() => {
        const connect = () => database.setup().then(() => {
            database.observableTasks().subscribe(allTasks => {
                setTasks(allTasks.map((t: any) => ({...t._data})));
            })
        });
        const scheduleReconnect = () => setTimeout(() => {
            if (database?.observableTasks()) {
                connect()
            } else {
                database.setup().then(() => {
                    console.log('connected')
                })
                scheduleReconnect()
            }
            }, 1000)
        scheduleReconnect();
    }, [])

    return (
    <>
        <div>
            <h1>
               TASKS
            </h1>
            <button onClick={handleAddTask} style={({marginBottom: '20px'})}>+</button>
            <div>
                {tasks.map((t: Task) => {
                    return (
                        <TaskCard key={t.uuid} task={t} onChange={updateTask} onDelete={(t: Task) => deleteTask(t.uuid)}/>
                    )
                })}
            </div>
</div>

    </>
  )
}

export default App
