import {Task} from "./Task.model";

export const TaskCard = (
    {
        task,
        onChange,
        onDelete
    }:{
        task: Task,
        onChange: (task: Task) => void
        onDelete: (task: Task) => void
}) => {
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => onChange({...task, name: event.target.value})
    const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => onChange({...task, description: event.target.value})

    return (
        <div style={({width:'15em', backgroundColor: 'darkolivegreen', borderColor: 'white', borderRadius : '3px', borderWidth: '3px', borderStyle:'solid', marginBottom: '10px'})}>
            <h2>
                <input type='text' onChange={onNameChange} placeholder='name' value={task.name} ></input>
            </h2>
            <p>
                <input type='text' onChange={onDescriptionChange} placeholder='description' value={task.description}></input>
            </p>
            <button onClick={() => onDelete(task)}>X</button>
        </div>
    )
}
