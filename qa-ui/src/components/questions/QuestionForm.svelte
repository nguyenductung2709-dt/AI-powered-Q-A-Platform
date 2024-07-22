<script>
    import { courses, userUuid, questions, isQuestionFormVisible } from "../../stores/stores";

    let title = '';
    let description = '';
    let selectedCourseId = '';
    let socket;
    export let courseId;
  
    let availableCourses = [];
    courses.subscribe(value => {
      availableCourses = value;
    });

    function toggleQuestionForm() {
        isQuestionFormVisible.set(!$isQuestionFormVisible);
    }

    const createWebSocketConnection = async() => {
        socket = new WebSocket(`ws://${window.location.host}/api/ws?type=questions&courseId=${selectedCourseId}`);
        socket.onopen = () => console.log("WebSocket connection established");
        socket.onmessage = async(event) => {
            const data = JSON.parse(event.data);
            if (data) {
                console.log(data.question);
                questions.update($questions => {
                  return [data.question, ...$questions];
                });
            }
            console.log($questions);
        };
        socket.onclose = () => {
          console.log("WebSocket connection closed");
        };
        socket.onerror = (error) => console.error( error ); 
    }

    const postQuestion = async() => {
        const isConfirmed = window.confirm("Are you sure you want to post this question?");
        if (!isConfirmed) {
            return;
        }

        if (!title || !description || !selectedCourseId) {
            window.alert('Please fill in all fields');
            return;
        }
        try {
            if (Number(courseId) === Number(selectedCourseId)) {
              createWebSocketConnection();
            }
            const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseId: selectedCourseId,
                title: title,
                description: description,
                userId: $userUuid
            })
            });
  
            if (response.status === 400) {
                window.alert('Please wait for a little bit before posting another question');
                return;
            }

            if (!response.ok) {
                window.alert('Failed to post question');
                return;
            }

            title = '';
            description = '';
            selectedCourseId = '';
            window.alert('Question posted successfully');
            isQuestionFormVisible.set(!$isQuestionFormVisible);
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };
</script>

<div class = "overflow-hidden p-0">
  <div class="flex flex-col items-center gap-8 mt-4">
    <button on:click = {toggleQuestionForm} class="absolute top-2 left-2 bg-red-600 hover:bg-red-900 focus:outline-none h-6 w-6 flex items-center justify-center text-white rounded-full">X</button>
    <h1 class="font-serif font-medium text-5xl sm:text-7xl mb-2 text-center text-black">Question Form</h1>
  
    {#if availableCourses}
      <div class="w-4/5">
        <p class="font-medium text-2xl mb-2 text-black">Course:</p>
        <select bind:value={selectedCourseId} class="block w-full h-12 text-lg text-gray-900 bg-white shadow-md shadow-white rounded-lg border">
          <option value="" disabled selected>Select a course</option>
          {#each availableCourses as course}
            <option value={course.id}>{course.title}</option>
          {/each}
        </select>
      </div>
    {:else}
      <div class="w-4/5">
        <p class="font-medium text-2xl mb-2 text-black">Course:</p>
        <select class="block w-full h-12 text-lg text-gray-900 bg-white shadow-md shadow-white rounded-lg border" disabled>
          <option>No courses available</option>
        </select>
      </div>
    {/if}
  
    <div class="w-4/5">
      <p class="font-medium text-2xl mb-2 text-black">Title:</p>
      <textarea id = "titleBox" bind:value={title} class="block w-full h-12 text-lg text-gray-900 bg-white shadow-md shadow-white rounded-lg border" placeholder="Write the title of your problem"></textarea>
    </div>
  
    <div class="w-4/5 h-60 mb-8">
      <p class="font-medium text-2xl mb-2 text-black">Details of your problem:</p>
      <textarea id = "descriptionBox" bind:value={description} class="block w-full h-full text-lg text-gray-900 bg-white shadow-md shadow-white rounded-lg border" placeholder="Write the details of your problem"></textarea>
    </div>
  
    <button on:click = {postQuestion} class="text-sm w-28 focus:ring-4 font-medium mb-4 rounded-lg px-5 py-2.5 text-center text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500">
      Create question
    </button>
  </div>
</div>
  