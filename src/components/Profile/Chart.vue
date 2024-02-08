<script setup>
  import { ref, reactive, watch, onMounted } from 'vue'
  import { Line } from 'vue-chartjs'
  import { NSpin } from 'naive-ui'

  const loading = ref(true)

  const props = defineProps({
    labels: Array,
    data: Array,
    loading: Boolean,
  })

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineController,
    LineElement,
    Filler,
  } from 'chart.js'

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineController,
    LineElement,
    Filler
  )

  const chartData = reactive({
    labels: props.labels,
    datasets: [
      {
        label: 'Score',
        borderColor: '#60aeef',
        backgroundColor: 'rgba(248, 121, 121, 0.2)',
        data: props.data,
        borderWidth: 5,
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: {
          target: 'origin',
          above: '#292f39',
        },
      },
    ],
  })

  const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: '#22272f',
        },
        ticks: {
          color: '#edeff5',
          font: {
            size: 18,
          },
        },
      },
      y: {
        grid: {
          color: '#22272f',
        },
        ticks: {
          color: '#edeff5',
          font: {
            size: 18,
          },
        },
      },
    },
    plugins: {
      filler: {
        propagate: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
      },
    },
    elements: {
      line: {
        tension: 0.3,
      },
    },
  })

  onMounted(() => {
    loading.value = props.loading
  })

  watch(
    () => props.data,
    (newData) => {
      chartData.datasets[0].data = newData
    }
  )

  watch(
    () => props.labels,
    (newLabels) => {
      chartData.labels = newLabels
      loading.value = props.loading
    }
  )
</script>

<template>
  <div class="chart" v-if="!loading">
    <Line
      :data="chartData"
      :options="chartOptions"
      :key="chartData.labels.join()"
    />
  </div>
  <div class="chart" v-else>
    <NSpin size="small" />
  </div>
</template>

<style scoped>
  .chart {
    background-color: #262a35;
    border-radius: 5rem;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  @media screen and (max-width: 768px) {
    .chart {
      height: 80vh;
      margin-bottom: 5rem;
    }
  }
</style>
