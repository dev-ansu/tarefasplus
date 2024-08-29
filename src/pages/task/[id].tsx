import Head from "next/head";
import styles from "./styles.module.css"
import { GetServerSideProps } from "next";
import { db } from "@/services/firebaseConnection";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { TaskProps } from "../dashboard";
import Textarea from "@/components/Textarea";
import { useSession } from "next-auth/react";
import { ChangeEvent, FormEvent, MouseEvent, useState } from "react";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";

interface TaskPropsExtended{
    task: Omit<TaskProps, 'createdAt'> & {createdAt: string;},
    allComments: CommentProps[],
}



const Task = ({task, allComments}: TaskPropsExtended)=>{
    const [input, setInput] = useState('');
    const {data: session,} = useSession();
    const [comments, setComments] = useState<CommentProps[]>(allComments || [])

    const handleSubmitForm = async(e: FormEvent)=>{
        e.preventDefault();
        if(input.trim() === ''){
            toast.error("O comentário não pode ser vazio.")
            return;
        }
        if(!session?.user?.email || !session?.user?.name){
            return;
        }

        try{
            
            const docRef = await addDoc(collection(db, 'comments'), {
                taskId: task?.id,
                user: session?.user?.email,
                createdAt: new Date(),
                name: session?.user?.name,
                comment: input,
            });
            let data ={
                id: docRef.id,
                taskId: task?.id,
                user: session?.user?.email,
                createdAt: new Date().toLocaleDateString(),
                name: session?.user?.name,
                comment: input,
            };
            setComments((prev) => [...prev, data])
            setInput('');
            toast.success("Registro salvo com sucesso.");
        }catch(err){
            toast.error("Não foi possível registrar o comentário.");
            console.log(err);
        }     
    }

    const handleDeleteComment = async(e: MouseEvent<HTMLButtonElement>, id: string)=>{
        e.preventDefault();

        if(window.confirm("Deseja realmente realizar esta ação?")){
            try{
                const docRef = doc(db, 'comments', id);
                await deleteDoc(docRef);
                const newComments = comments.filter( comment => comment.id !== id );
                setComments(newComments);
                toast.success("Comentário deletado com sucesso.");
            }catch(err){
                toast.error("Houve um erro ao tentar deletar o comentário.");
                console.log(err);
            }     
        }
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>
            <main className={styles.main}>
                <h1>Tarefa</h1>                  
                <article className={styles.task}>
                    <p>{task.task}</p>
                </article>
            </main>
            {!session?.user && <h2 className={styles.title}>Autentique-se para comentar</h2> }
            {session?.user &&
                <section className={styles.commentsContainer}>
                    <h2 className={styles.title}>Deixar comentário</h2>
                    <form onSubmit={handleSubmitForm}>
                        <Textarea 
                            autoFocus
                            value={input}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            placeholder="Digite seu comentário..."
                            />
                        <button  className={styles.button}>Enviar comentário</button>
                    </form>
                </section>
            }
            <section className={styles.commentsContainer}>
                <h2 className={styles.title}>Todos os comentários</h2>
                {comments.length == 0 && <span>Nenhum comentário encontrado.</span>}
                {comments.length > 0 &&
                    comments.map(comment => (
                        <article key={comment.id} className={styles.comment}>
                            <div className={styles.headComment}>
                                <label className={styles.commentsLabel}>{comment.name}</label>
                                {comment.user === session?.user?.email &&
                                    <button onClick={(e) => handleDeleteComment(e, comment.id)} className={styles.buttonTrash}>
                                        <FaTrash size={18} color="#ea3140" />
                                    </button>
                                }
                            </div>
                            <p className={styles.commentText}>{comment.comment}</p>
                            <p className="text-xs mt-2 w-full text-right text-zinc-500">{comment.createdAt}</p>
                        </article>
                    ))
                }
            </section>
        </div>
    )
}

export default Task;

interface CommentProps{
    id: string;
    comment: string;
    taskId: string;
    user: string;
    name: string;
    createdAt: string;
}

export const getServerSideProps: GetServerSideProps = async({params})=>{
    const id = params?.id as string;
    const docRef = doc(db, 'tasks', id);
    const q = query(collection(db, "comments"), where('taskId', "==", id));
    let task = {};
    let allComments:CommentProps[] = [];
    try{
        const snapshot = await getDoc(docRef);
        if(!snapshot.exists() || !snapshot.data().public){
            return{
                redirect:{
                    destination:"/",
                    permanent:false,
                }
            }
        }
        const snapshotComments = await getDocs(q);
        snapshotComments.forEach(doc =>{
            const data = doc.data();
            const miliseconds = data?.createdAt?.seconds * 1000 ; 
            allComments.push({
                id: doc.id,
                comment: data.comment,
                createdAt: new Date(miliseconds).toLocaleDateString(),
                name: data.name,
                taskId: data.taskId,
                user: data.user
            })
        })
        const data = snapshot.data();
        const miliseconds = data?.createdAt?.seconds * 1000 ; 
        task = {
            id: id,
            task: data?.task,
            createdAt: new Date(miliseconds).toLocaleDateString(),
            public: data?.public,
            user: data?.user,
        }

    }catch(err){
        console.log(err);
    } 
    
    return{
        props:{
            task,
            allComments,
        }
    }
}