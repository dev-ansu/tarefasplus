import { GetServerSideProps } from "next";
import styles from "./styles.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";
import Textarea from "@/components/Textarea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {db} from "@/services/firebaseConnection"
import { addDoc, collection, query, orderBy,where,onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Link from "next/link";
import ConfirmationMessage from "@/components/ConfirmationMessage";


interface HomeProps{
    user: {
        email: string;
    }
}

export interface TaskProps{
    id: string;
    user: string;
    task: string;
    public: boolean;
    createdAt: Date;
}

const Dashboard = ({user}: HomeProps)=>{
    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [tasks, setTasks] = useState<TaskProps[]>([]);

    const loadTasks = async()=>{
        const tarefasRef = collection(db, 'tasks');
        const q = query(tarefasRef,
            orderBy('createdAt', 'desc'),
            where("user", "==", user?.email),
        )
        try{
            onSnapshot(q, (snapshot)=>{
                let lista = [] as TaskProps[];
                snapshot.forEach((doc) =>{
                    const data = doc.data() as TaskProps;
                    data.id = doc.id as string;
                    lista.push({
                        ...data,
                    });
                });
                setTasks(lista);
            })
        }catch(err){
            console.log(err);
        }
    }

    useEffect(()=>{
        loadTasks();
    },[user?.email])

    const handleChangePublic = (e: ChangeEvent<HTMLInputElement>)=>{
        setPublicTask(true);
    }

    const handleRegisterTask = async(e: FormEvent)=>{
        e.preventDefault();
        if(input.trim() === "") return;
        try{
            await addDoc(collection(db, 'tasks'), {
                user: user?.email,
                task: input,
                public: publicTask,
                createdAt: new Date(), 
            });
            setInput("");
            setPublicTask(false);
            toast.success("Tarefa salva com sucesso.")
        }catch(err){
            console.log(err);
            toast.error("Não possível salvar a tarefa.");
        }
    }

    const handleDelete = async(id: string)=>{
        
    }
    
    const handleDeleteTask = async(id:string)=>{
        if(window.confirm('Deseja realmente realizar esta ação?')){
            const docRef = doc(db, 'tasks', id);
            try{
                await deleteDoc(docRef);
                toast.success('Registro excluído com sucesso.')
            }catch(err){
                toast.error("Erro ao tentar excluir o item.")
                console.log(err);
            }
        }
    }

    const handleShare = async(id:string)=>{
        try{
            await navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_BASE_URL}/task/${id}`
            )
            toast.success("URL copiada com sucesso.")
        }catch(err){
            toast.error("Houve um erro ao tentar copiar a tarefa.")
            console.log(err);
        }

    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>
            
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa?</h1>
                        <form onSubmit={handleRegisterTask}>
                            <Textarea
                                value={input}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>)=> setInput(e.target.value)}
                                placeholder="Digite qual sua tarefa"

                            />
                            <div className={styles.checkboxArea}>
                                <input onChange={handleChangePublic} checked={publicTask} id="checkBox" type="checkbox" className={styles.checkbox} />
                                <label htmlFor="checkBox">Deixar tarefa pública?</label>
                            </div>
                            <button className={styles.button}>Registrar</button>
                        </form>

                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>

                    {tasks && tasks.map( task => (
                        <article key={task.id} className={styles.task}>
                            {task.public && 
                                <div className={styles.tagContainer}>
                                    <label htmlFor="" className={styles.tag}>PÚBLICA</label>
                                    <button onClick={()=> handleShare(task.id) } className={styles.shareButton}>
                                        <FiShare2 size={22} color="#3183FF" />
                                    </button>
                                </div>
                            }
                            <div className={styles.taskContent}>
                                {task?.public ?
                                    <Link href={`/task/${task.id}`}>
                                        <p>{task.task}</p>
                                    </Link>
                                :(
                                    <p>{task.task}</p>
                                )}
                                <button onClick={()=> handleDeleteTask(task.id)} className={styles.trashButton}><FaTrash size={24} color="#ea3140" /></button>
                            </div>
                        </article>
                    ))}

                    
                </section>
            </main>
        </div>
    )
}


export default Dashboard;

export const getServerSideProps: GetServerSideProps = async({ req })=>{
    const session = await getSession({ req });
    
    // Se não há usuário logado, então redirecione para home
    if(!session?.user){
        return {
            redirect:{
                destination:"/",
                permanent:false,
            },
        }
    }

    return {
        props: {
            user: {
                email: session?.user?.email
            }
        }
    };
}