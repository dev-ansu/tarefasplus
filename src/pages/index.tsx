import styles from "@/styles/home.module.css";
import Image from "next/image";
import hero from "../../public/assets/img/hero.png";
import { GetStaticProps } from "next";
import { collection, getDocs, getDocsFromServer } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";

interface HomeProps{
  tasks: number,
  comments: number;
}

export default function Home({tasks, comments}:  HomeProps) {
  return (
    <main className={styles.container}>
      <div className={styles.logoContent}>
        <Image
          className={styles.hero}
          alt="Logo tarefas+"
          src={hero}
          priority
        />
        <h1 className={styles.title}>
          Sistema feito para você organizar <br /> 
          seus estudos e tarefas.
        </h1>
      </div>
      
      <div className={styles.infoContent}>
        <section className={styles.box}>
          <span>+{tasks} tarefas</span>
        </section>
        <section className={styles.box}>
          <span>+{comments} comentários</span>
        </section>
      </div>

    </main>
  );
}

export const getStaticProps: GetStaticProps = async()=>{
  const commentRef = collection(db, 'comments');
  const commentSnapshot = await getDocs(commentRef);
  const tasksRef = collection(db, 'tasks');
  const tasksSnapshot = await getDocs(tasksRef);
  return{
    props:{
      tasks: tasksSnapshot.size || 0,
      comments: commentSnapshot.size || 0
    },
    revalidate: 60, //será revalidado após 60 segundos
  }
}