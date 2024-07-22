<style>
    .spinner {
      border: 8px solid rgba(0, 0, 0, 0.1);
      border-left-color: #4A90E2;
      border-radius: 50%;
      width: 64px;
      height: 64px;
      animation: spin 1s linear infinite;
    }
  
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  </style>
  
  <div class="spinner"></div>
  