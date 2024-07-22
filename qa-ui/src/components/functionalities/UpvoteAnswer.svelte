<script>
  import { userUuid } from "../../stores/stores";
  export let answerId;
  export let upvotes;
  export let upVoteList;
  export let downVoteList;
  let hasUpvoted = false;
  let hasDownvoted = false;
  
  if (upVoteList) {
      hasUpvoted = upVoteList.includes($userUuid);
  }
  if (downVoteList) {
      hasDownvoted = downVoteList.includes($userUuid);
  }

  const handleUpvote = async () => {
      try {
          const response = await fetch(`/api/answers/${answerId}/upvote`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: $userUuid,
                newDate: new Date()
            })
          });
          if (response.status === 400) {
            upvotes -= 1;
            hasUpvoted = false;
            return;
          }
          if (!response.ok) {
              throw new Error("Failed to upvote answer");
          }
          if (hasDownvoted) {
              upvotes += 2;
          } else {
              upvotes += 1;
          }
          hasDownvoted = false;
          hasUpvoted = true;
      } catch (error) {
          console.error(error);
      }
  }

  const handleDownvote = async () => {
      try {
          const response = await fetch(`/api/answers/${answerId}/downvote`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: $userUuid,
                newDate: new Date()
            })
          });
          if (response.status === 400) {
            upvotes += 1;
            hasDownvoted = false;
            return;
          }
          if (!response.ok) {
              throw new Error("Failed to downvote answer");
          }
          console.log(response);
          if (hasUpvoted) {
              upvotes -= 2;
          } else {
              upvotes -= 1;
          }
          hasUpvoted = false;
          hasDownvoted = true;
      } catch (error) {
          console.error(error);
      }
  }
</script>
  
<div class="flex flex-col items-center space-y-1">
  <button on:click={handleUpvote} class="focus:outline-none" aria-label="Upvote">
    {#if hasUpvoted}
      <p class="icon upvote">▲</p>
    {:else}
      <p class="icon">▲</p>
    {/if}
  </button>
  <span class="text-lg text-white">{upvotes}</span>
  <button on:click={handleDownvote} class="focus:outline-none" aria-label="Downvote">
    {#if hasDownvoted}
      <p class="icon downvote">▼</p>
    {:else}
      <p class="icon">▼</p>
    {/if}
  </button>
</div>

<style>
  .icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
  .icon.upvote {
    color: #007bff;
  }
  .icon.downvote {
    color: #dc3545;
  }
</style>


