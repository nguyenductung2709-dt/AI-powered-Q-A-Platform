<script>
    import { onMount } from "svelte";
    import { formatDate } from "../../utils/formatDate"; 
    import { questions, isQuestionFormVisible } from "../../stores/stores";
    import QuestionForm from "../questions/QuestionForm.svelte";
    import Navbar from "../functionalities/Navbar.svelte";
    import Spinner from "../functionalities/Spinner.svelte"; 
    import { get } from 'svelte/store';

    export let id;

    let page = 1; 
    let loading = false; 
    let allLoaded = false; 

    function toggleQuestionForm() {
        isQuestionFormVisible.update(visible => !visible);
    }

    const fetchQuestions = async () => {
        if (loading || allLoaded) return;

        loading = true;
        try {
            const response = await fetch(`/api/courses/${id}?page=${page}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 404) {
                location.href = '/404';
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch questions");
            }

            const data = await response.json();

            if (data.length < 20) {
                allLoaded = true;
            }
            questions.update(q => [...q, ...data]);
            page += 1; 
        } catch (error) {
            console.error(error);
        } finally {
            loading = false;
        }
    };

    const handleScroll = () => {
        const lastQuestion = document.querySelector('.question:last-child');
        if (lastQuestion) {
            const lastQuestionOffset = lastQuestion.offsetTop + lastQuestion.clientHeight;
            const pageOffset = window.pageYOffset + window.innerHeight;
            
            if (pageOffset > lastQuestionOffset - 200 && get(questions).length >= 7 && !loading && !allLoaded) {
                fetchQuestions();
            }
        }
    };

    onMount(async () => {
        await fetchQuestions();
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });
</script>

<div>
    <Navbar/>
    {#if $isQuestionFormVisible}
    <div class="dark-overlay">
        <div class="question-form-modal">
            <QuestionForm courseId = {id}/>
        </div>
    </div>
    {/if}

    <div class="flex justify-center items-center gap-8 mt-20">
        <h1 class="font-serif font-medium text-5xl sm:text-7xl mb-20 text-center">Questions</h1>
        <button on:click={toggleQuestionForm} class="text-sm mb-16 w-28 focus:ring-4 font-medium rounded-lg px-5 py-2.5 text-center text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500">
            Ask question
        </button>
    </div>
    
    <div class="flex flex-col justify-center items-center gap-8">
        {#each $questions as question}
            <div class="question flex w-5/6 bg-secondary_dark rounded-lg pt-2 pb-2 shadow-md shadow-white">
                <div class="flex flex-col basis-1/6 justify-center items-end text-xs mr-4">
                    <p>{question.upvotes} upvotes</p>
                    <p> {question.answers_count} answers</p>
                    <p>Created by {question.user_id}</p>
                    <p class="text-end">at {formatDate(question.created_time)}</p>
                </div>
                <div class="basis-5/6">
                    <a href={`/questions?id=${question.id}`}>
                        <h2 class="font-medium text-white hover:text-gray-500">{question.title}</h2>
                    </a>
                    <p>{question.description}</p>
                </div>
            </div>
        {/each}
    </div>
    {#if loading}
        <div class="text-center mt-4">
            <Spinner />
        </div>
    {/if}
    {#if allLoaded}
        <div class="text-center mt-4">All questions loaded</div>
    {/if}
</div>

<style> 
    .dark-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10; 
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .question-form-modal {
        position: relative;
        z-index: 20; 
        background-color: white;
        padding: 20px;
        border-radius: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        height:80%;
        width: 65%;
        overflow-y: auto;
    }

    ::-webkit-scrollbar {
        width: 10px;
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: lightgray;
        border-radius: 10px;
    }

    ::-webkit-scrollbar-corner {
        border-radius: 10px;
    }
</style>
