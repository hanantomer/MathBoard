<template></template>

<script setup lang="ts">
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();

watchHelper.watchPointerEvent(
  ["CARTESIAN_SYSTEM_STARTED"],
  ["EV_SVG_POINTERDOWN"],
  drawCartesianSystem,
);

function drawCartesianSystem(e: PointerEvent) {
  notationMutateHelper.addCartesianSystemAtClickedPoint(e);
}
</script>
