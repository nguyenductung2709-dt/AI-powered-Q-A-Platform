<script>
    let description = '';
    export let questionId;
    let socket;
    import { userUuid, answers, numAnswers } from "../../stores/stores.js";

    const createWebSocketConnection = async() => {
        socket = new WebSocket(`ws://${window.location.host}/api/ws?type=answers&questionId=${questionId}`);
        socket.onopen = () => console.log("WebSocket connection established");
        socket.onmessage = async(event) => {
            const data = JSON.parse(event.data);
            if (data) {
                answers.set([data.answer, ...$answers]);
            }
        };
        socket.onclose = () => {
          console.log("WebSocket connection closed");
        };
        socket.onerror = (error) => console.error( error );   
    }

    const postAnswer = async() => {
        if (!description) {
            window.alert('Please fill in all fields');
            return;
        }
        try {
            createWebSocketConnection();
            const response = await fetch('/api/answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    questionId: questionId,
                    description: description,
                    userId: $userUuid
                })
            });

            if (response.status === 400) {
                window.alert('Please wait for a little bit before posting another answer');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to post answer');
            }
            description = '';
            numAnswers.update(n => n + 1);
            window.alert('Answer posted successfully');
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    }
</script>

<p class = "font-serif font-medium text-2xl sm:text-4xl mb-2"> Your answer </p>
<textarea bind:value={description} class="block w-full h-5/6 text-lg text-gray-900 bg-white shadow-md shadow-white rounded-lg border" placeholder="Write your answer here"></textarea>
<button on:click = {postAnswer} class = "mt-4 w-28 h-10 focus:ring-4 font-medium rounded-lg text-sm text-center text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500">
    Submit answer
</button>