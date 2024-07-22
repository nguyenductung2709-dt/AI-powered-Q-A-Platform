<script>
    import { courses } from "../../stores/stores";
    import Navbar from "../functionalities/Navbar.svelte";
</script>

<div>
    <Navbar />
    <h1 class="font-serif font-medium text-5xl sm:text-7xl mt-20 mb-20 text-center">Courses</h1>
    <div class="flex flex-wrap justify-center gap-8">
        {#each $courses as course}
            <div class="w-1/4 aspect-square bg-secondary_dark rounded-2xl flex flex-col items-center shadow-lg shadow-white"> 
                <p class="w-10/12 text-2xl h-16 font-medium text-center mt-4 mb-2">{course.title}</p>
                <p class="w-11/12 text-lg mt-8 mb-8">{course.description}</p>
                <p class="text-sm mb-4">Date added: {course.formattedDate}</p>
                <p class="text-sm mb-4">Number of questions: {course.questions_count}</p>
                <a href={`/courses?id=${course.id}`}>
                    <button class="text-sm mb-4 w-28 focus:ring-4 font-medium rounded-lg px-5 py-2.5 text-center text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500"> 
                        See More
                    </button>
                </a>
            </div>
        {/each}
    </div>
</div>
