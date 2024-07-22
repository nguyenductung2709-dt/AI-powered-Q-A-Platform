<script>
    import { onMount } from 'svelte';
    import { numAnswers } from '../../stores/stores';
    import UpvoteQuestion from '../functionalities/UpvoteQuestion.svelte';
    import Answers from '../answers/Answers.svelte'
    import AnswerForm from '../answers/AnswerForm.svelte'
    import Navbar from "../functionalities/Navbar.svelte";
    export let id;
    
    let question = null;

    const fetchQuestion = async () => {
        try {
            const response = await fetch(`/api/questions/${id}`, {
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
            question = data[0];
            numAnswers.set(question.answers_count);
            console.log(question);
        } catch (error) {
            console.error(error);
        }
    };

    onMount(async () => {
        await fetchQuestion();
    });
</script>

    <Navbar />
{#if question}
    <div class = "flex flex-col items-center mt-20 overflow-hidden w-screen"> 
        <div class = "flex justify-start items-center gap-8 w-5/6">
            <h1 class="basis-5/6 font-serif font-medium text-2xl sm:text-4xl mt-8 mb-20"> {question.title} </h1>
        </div>

        <div class = "flex justify-start items-center w-5/6">
            <div class = "basis-1/12">
                <UpvoteQuestion 
                    questionId = {id} 
                    upvotes = {question.upvotes}
                    upVoteList = {question.upvote_user_ids}
                    downVoteList = {question.downvote_user_ids}
                />
            </div>
            <div class = "basis-11/12 text-left">
                <p class = "text-xl"> {question.description} </p>
            </div>
        </div>

        <div class = "flex flex-col items-start w-5/6 mt-10">
            <AnswerForm questionId = {question.id}/>
        </div>

        <div class = "flex flex-col items-start w-5/6 mt-10">
            <Answers questionId = {question.id}/>
        </div>
    </div>
{:else}
    <div>Loading...</div>
{/if}
