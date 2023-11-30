import {createRxDatabase, RxDatabase} from 'rxdb';
import {getRxStorageDexie} from 'rxdb/plugins/storage-dexie';
import {getFetchWithCouchDBAuthorization, replicateCouchDB} from 'rxdb/plugins/replication-couchdb';
import {BehaviorSubject} from "rxjs";
import {Task, TaskDTO, TaskUUID} from "./Task.model";
// Good article that talk about ts typing and rxdb: https://rxdb.info/tutorials/typescript.html

let database: RxDatabase;
export const rxDB: () => {
    setup: () => Promise<void>,
    create: (name: string, description: string, uuid: string) => Promise<void>;
    update: (name: string, description: string, uuid: string) => Promise<void>;
    delete: (uuid: TaskUUID) => Promise<void>;
    observableTasks: () => BehaviorSubject<Task[]>;
} = () => {
    console.log('Get rx db');

    return {
        setup: async () => {
            console.log('Setup rx db')
            if (!database) {
                database = await createRxDatabase({
                    name: 'tasks',
                    storage: getRxStorageDexie(),
                    ignoreDuplicate: true,
                });

                // RxDB  is defined using the JSON schema format: https://json-schema.org/, what is JSON schema(https://json-schema.org/understanding-json-schema/about)
                const tasksSchema = {
                    version: 0,
                    primaryKey: 'id',
                    primaryPath: 'id',
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            primary: true,
                            maxLength: 100 // <- the primary key must have set maxLength
                        },
                        name: {
                            type: 'string'
                        },
                        description: {
                            type: 'name'
                        },
                    },
                    required: ['id', 'name', 'description']
                }

                const collection = await database.addCollections({
                    tasks: {
                        schema: tasksSchema,
                    },
                })

                replicateCouchDB(
                    {
                        collection: collection.tasks,
                        // url to the CouchDB endpoint (required)
                        url: 'http://localhost:5984/todos/',
                        /**
                         * true for live replication,
                         * false for a one-time replication.
                         * [default=true]
                         */
                        live: true,
                        /**
                         * A custom fetch() method can be provided
                         * to add authentication or credentials.
                         * Can be swapped out dynamically
                         * by running 'replicationState.fetch = newFetchMethod;'.
                         * (optional)
                         */
                        fetch: getFetchWithCouchDBAuthorization('admin', 'password'),
                    }
                );

            }
        },
        create: async (name: string, description: string, uuid: string) => {
            await database.tasks.insert({
                uuid,
                id: uuid,
                name,
                description
            });
        },
        update: async (name: string, description: string, uuid: string) => {
            const storedBeam = await database.tasks.findOne({selector: {id: uuid}}).exec();
            storedBeam.modify((taskData: TaskDTO) => {
                taskData.name = name;
                taskData.description = description
                return taskData
            })

        },
        delete: async (uuid: TaskUUID) => {
            const storedTask = await database.tasks.findOne({selector: {id: uuid}}).exec();
            storedTask.remove();

        },
        observableTasks: () => {
             // $ gets the observable
            return database?.tasks?.find().$;
        }
    }
}
