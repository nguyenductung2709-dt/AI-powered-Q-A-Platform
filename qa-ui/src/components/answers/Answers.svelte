<script>
    import { onMount } from 'svelte';
    import { formatDate } from '../../utils/formatDate'; 
    import { answers, numAnswers } from '../../stores/stores';   
    export let questionId;
    import UpvoteAnswer from '../functionalities/UpvoteAnswer.svelte';
    import { get } from 'svelte/store';

    let loading = false; 
    let allLoaded = false;
    let page = 1;

    const fetchAnswers = async () => {
        if (loading || allLoaded) return;
        loading = true;

        try {
            console.log(questionId);
            const firstResponse = await fetch(`/api/questions/${questionId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!firstResponse.ok) {
                throw new Error("Failed to fetch question");
            }

            const questionData = await firstResponse.json();
            numAnswers.set(questionData[0].answers_count);

            const secondResponse = await fetch(`/api/answers/${questionId}?page=${page}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!secondResponse.ok) {
                throw new Error("Failed to fetch answers");
            }

            const data = await secondResponse.json();
            if (data.length < 20) {
                allLoaded = true;
            }
            answers.update(a => [...a, ...data]);
            page += 1;
        } catch (error) {
            console.error(error);
        } finally {
            loading = false;
        }
    };

    const handleScroll = () => {
        const lastAnswer = document.querySelector('.answer:last-child');
        if (lastAnswer) {
            const lastAnswerOffset = lastAnswer.offsetTop + lastAnswer.clientHeight;
            const pageOffset = window.pageYOffset + window.innerHeight;

            if (pageOffset > lastAnswerOffset - 200 && !loading && !allLoaded) {
                fetchAnswers();
            }
        }
    };

    onMount(async () => {
        // Reset answers store and fetch data on mount
        answers.set([]);
        allLoaded = false;
        page = 1;

        await fetchAnswers();
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });
</script>

<p class="font-serif font-medium text-2xl sm:text-4xl mb-6">{$numAnswers} Answers</p>
{#if $answers.length > 0}
    {#each $answers as answer}
        <div class="answer mb-8 flex w-11/12 overflow-hidden">
            <div class="basis-1/12">
                <UpvoteAnswer
                    answerId={answer.id}
                    upvotes={answer.upvotes}
                    upVoteList={answer.upvote_user_ids}
                    downVoteList={answer.downvote_user_ids}
                />
            </div>
            <div class="basis-11/12 flex flex-col">
                <div class="flex gap-2 text-sm mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 rounded-full bg-gray-200">
                        <circle cx="12" cy="12" r="10" fill="white" stroke="currentColor" stroke-width="2"/>
                        <path d="M15.11 14.36a1.5 1.5 0 0 0-1.29-1.5v-2.22h1.87v-1.8h-1.87V8.88a2.87 2.87 0 0 1 1.23-.28c.95 0 1.71.77 1.71 1.71v1.71h-1.73v1.79h1.73v2.22h-1.72z" fill="currentColor"/>
                      </svg>                                                               
                    <p>{answer.user_id}</p>
                    <p>{formatDate(answer.created_time)}</p>
                </div>
                <p class="text-lg">{answer.description}</p>
            </div>
        </div>
    {/each}
{:else}
    <div>Loading...</div>
{/if}
