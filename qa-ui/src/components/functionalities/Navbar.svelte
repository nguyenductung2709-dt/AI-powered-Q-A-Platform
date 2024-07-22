<script>
  import { userUuid } from "../../stores/stores.js";
</script>

<nav class = "bg-secondary_dark fixed top-0 left-0 z-50 h-14 w-full gap-10 shadow-white">
    <ul class ="flex items-center justify-start space-x-5 p-5 font-dm-sans text-sm sm:text-lg font-light transform -translate-y-[1vh]">
      <li>
        <a href = "/" class ="transition-colors duration-300 hover:text-gray-300">
          Homepage
        </a>
      </li>
      <li>
        <p> Hello {$userUuid} </p>
      </li>
    </ul>
</nav>