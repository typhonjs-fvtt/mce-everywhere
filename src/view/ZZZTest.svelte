<script>

</script>

<div />

<style>
   div {
      width: 100%;
      height: 100%;
      background: green;
   }

   @media (max-width: 1000px) {
      div {
         background: deeppink;
      }
   }

   @container main (min-width: 0) {
      div {
         background: blue;
      }
   }

   @container main (min-width: 200px) {
      div {
         background: red;
      }
   }
</style>