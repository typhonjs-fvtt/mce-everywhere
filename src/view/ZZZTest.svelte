<script>

</script>

<div />

<style>
   div {
      width: 100%;
      height: 100%;
      background: green;
   }

   @container main (width <= 500px) {
      div {
         background: blue;
      }
   }

   @container main (width > 600px) {
      div {
         background: red;
      }
   }
</style>