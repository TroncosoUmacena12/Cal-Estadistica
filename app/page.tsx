"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { BarChart, AreaChart, Bar,Tooltip, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipos de probabilidad
const probabilityTypes = [
  { value: "exact", label: "P(X=a) - Probabilidad exacta" },
  { value: "atMost", label: "P(X≤a) - A lo mucho a" },
  { value: "atLeast", label: "P(X≥a) - Al menos a" },
  { value: "moreThan", label: "P(X>a) - Más de a" },
  { value: "lessThan", label: "P(X<a) - Menos de a" },
  { value: "between", label: "P(a≤X≤b) - Entre a y b (inclusive)" },
  { value: "outside", label: "P(X≤a or X≥b) - Fuera del rango [a,b]" },
]

// Funciones matemáticas auxiliares
const factorial = (n: number): number => {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

const combination = (n: number, k: number): number => {
  if (k > n) return 0
  return factorial(n) / (factorial(k) * factorial(n - k))
}

const normalPDF = (x: number, mean: number, std: number): number => {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2))
}

const normalCDF = (x: number, mean: number, std: number): number => {
  const z = (x - mean) / std
  return 0.5 * (1 + erf(z / Math.sqrt(2)))
}

const erf = (x: number): number => {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}

export default function EstadisticaApp() {
  // Estados para Binomial
  const [binomialN, setBinomialN] = useState(10)
  const [binomialP, setBinomialP] = useState(0.5)
  const [binomialProbType, setBinomialProbType] = useState("exact")
  const [binomialA, setBinomialA] = useState(5)
  const [binomialB, setBinomialB] = useState(7)
  const [binomialData, setBinomialData] = useState<any[]>([])
  const [binomialResult, setBinomialResult] = useState<number>(0)
  const [binomialResultText, setBinomialResultText] = useState("")

  // Estados para Poisson
  const [poissonLambda, setPoissonLambda] = useState(3)
  const [poissonProbType, setPoissonProbType] = useState("exact")
  const [poissonA, setPoissonA] = useState(2)
  const [poissonB, setPoissonB] = useState(4)
  const [poissonData, setPoissonData] = useState<any[]>([])
  const [poissonResult, setPoissonResult] = useState<number>(0)
  const [poissonResultText, setPoissonResultText] = useState("")

  // Estados para Hipergeométrica
  const [hyperN, setHyperN] = useState(50)
  const [hyperK, setHyperK] = useState(20)
  const [hyperSampleN, setHyperSampleN] = useState(10)
  const [hyperProbType, setHyperProbType] = useState("exact")
  const [hyperA, setHyperA] = useState(4)
  const [hyperB, setHyperB] = useState(6)
  const [hyperData, setHyperData] = useState<any[]>([])
  const [hyperResult, setHyperResult] = useState<number>(0)
  const [hyperResultText, setHyperResultText] = useState("")

  // Estados para Normal
  const [normalMean, setNormalMean] = useState(2000)
  const [normalStd, setNormalStd] = useState(400)
  const [normalProbType, setNormalProbType] = useState("between")
  const [normalA, setNormalA] = useState(1600)
  const [normalB, setNormalB] = useState(2400)
  const [normalData, setNormalData] = useState<any[]>([])
  const [normalResult, setNormalResult] = useState<number>(0)
  const [normalResultText, setNormalResultText] = useState("")

  // Colores para las áreas sombreadas
  const highlightColors = {
    binomial: "#4f46e5", // Indigo
    poisson: "#0891b2", // Cyan
    hyper: "#7c3aed", // Violet
    normal: "#2563eb", // Blue
  }

  // Función para calcular probabilidad binomial
  const calculateBinomialProbability = (n: number, p: number, type: string, a: number, b: number) => {
    let result = 0
    let resultText = ""

    switch (type) {
      case "exact":
        result = combination(n, a) * Math.pow(p, a) * Math.pow(1 - p, n - a)
        resultText = `P(X = ${a}) = ${result.toFixed(6)}`
        break
      case "atMost":
        for (let i = 0; i <= a; i++) {
          result += combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i)
        }
        resultText = `P(X ≤ ${a}) = ${result.toFixed(6)}`
        break
      case "atLeast":
        for (let i = a; i <= n; i++) {
          result += combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i)
        }
        resultText = `P(X ≥ ${a}) = ${result.toFixed(6)}`
        break
      case "moreThan":
        for (let i = a + 1; i <= n; i++) {
          result += combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i)
        }
        resultText = `P(X > ${a}) = ${result.toFixed(6)}`
        break
      case "lessThan":
        for (let i = 0; i < a; i++) {
          result += combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i)
        }
        resultText = `P(X < ${a}) = ${result.toFixed(6)}`
        break
      case "between":
        for (let i = a; i <= b && i <= n; i++) {
          result += combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i)
        }
        resultText = `P(${a} ≤ X ≤ ${b}) = ${result.toFixed(6)}`
        break
      case "outside":
        for (let i = 0; i <= a; i++) {
          result += combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i)
        }
        for (let i = b; i <= n; i++) {
          result += combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i)
        }
        resultText = `P(X ≤ ${a} or X ≥ ${b}) = ${result.toFixed(6)}`
        break
    }

    return { result, resultText }
  }

  // Función para calcular probabilidad de Poisson
  const calculatePoissonProbability = (lambda: number, type: string, a: number, b: number) => {
    let result = 0
    let resultText = ""
    const maxValue = Math.max(20, lambda * 4)

    switch (type) {
      case "exact":
        result = (Math.pow(lambda, a) * Math.exp(-lambda)) / factorial(a)
        resultText = `P(X = ${a}) = ${result.toFixed(6)}`
        break
      case "atMost":
        for (let i = 0; i <= a; i++) {
          result += (Math.pow(lambda, i) * Math.exp(-lambda)) / factorial(i)
        }
        resultText = `P(X ≤ ${a}) = ${result.toFixed(6)}`
        break
      case "atLeast":
        for (let i = a; i <= maxValue; i++) {
          result += (Math.pow(lambda, i) * Math.exp(-lambda)) / factorial(i)
        }
        resultText = `P(X ≥ ${a}) = ${result.toFixed(6)}`
        break
      case "moreThan":
        for (let i = a + 1; i <= maxValue; i++) {
          result += (Math.pow(lambda, i) * Math.exp(-lambda)) / factorial(i)
        }
        resultText = `P(X > ${a}) = ${result.toFixed(6)}`
        break
      case "lessThan":
        for (let i = 0; i < a; i++) {
          result += (Math.pow(lambda, i) * Math.exp(-lambda)) / factorial(i)
        }
        resultText = `P(X < ${a}) = ${result.toFixed(6)}`
        break
      case "between":
        for (let i = a; i <= b && i <= maxValue; i++) {
          result += (Math.pow(lambda, i) * Math.exp(-lambda)) / factorial(i)
        }
        resultText = `P(${a} ≤ X ≤ ${b}) = ${result.toFixed(6)}`
        break
      case "outside":
        for (let i = 0; i <= a; i++) {
          result += (Math.pow(lambda, i) * Math.exp(-lambda)) / factorial(i)
        }
        for (let i = b; i <= maxValue; i++) {
          result += (Math.pow(lambda, i) * Math.exp(-lambda)) / factorial(i)
        }
        resultText = `P(X ≤ ${a} or X ≥ ${b}) = ${result.toFixed(6)}`
        break
    }

    return { result, resultText }
  }

  // Función para calcular probabilidad hipergeométrica
  const calculateHypergeometricProbability = (N: number, K: number, n: number, type: string, a: number, b: number) => {
    let result = 0
    let resultText = ""
    const maxX = Math.min(n, K)

    switch (type) {
      case "exact":
        result = (combination(K, a) * combination(N - K, n - a)) / combination(N, n)
        resultText = `P(X = ${a}) = ${result.toFixed(6)}`
        break
      case "atMost":
        for (let i = 0; i <= a && i <= maxX; i++) {
          const prob = (combination(K, i) * combination(N - K, n - i)) / combination(N, n)
          if (!isNaN(prob)) result += prob
        }
        resultText = `P(X ≤ ${a}) = ${result.toFixed(6)}`
        break
      case "atLeast":
        for (let i = a; i <= maxX; i++) {
          const prob = (combination(K, i) * combination(N - K, n - i)) / combination(N, n)
          if (!isNaN(prob)) result += prob
        }
        resultText = `P(X ≥ ${a}) = ${result.toFixed(6)}`
        break
      case "moreThan":
        for (let i = a + 1; i <= maxX; i++) {
          const prob = (combination(K, i) * combination(N - K, n - i)) / combination(N, n)
          if (!isNaN(prob)) result += prob
        }
        resultText = `P(X > ${a}) = ${result.toFixed(6)}`
        break
      case "lessThan":
        for (let i = 0; i < a && i <= maxX; i++) {
          const prob = (combination(K, i) * combination(N - K, n - i)) / combination(N, n)
          if (!isNaN(prob)) result += prob
        }
        resultText = `P(X < ${a}) = ${result.toFixed(6)}`
        break
      case "between":
        for (let i = a; i <= b && i <= maxX; i++) {
          const prob = (combination(K, i) * combination(N - K, n - i)) / combination(N, n)
          if (!isNaN(prob)) result += prob
        }
        resultText = `P(${a} ≤ X ≤ ${b}) = ${result.toFixed(6)}`
        break
      case "outside":
        for (let i = 0; i <= a && i <= maxX; i++) {
          const prob = (combination(K, i) * combination(N - K, n - i)) / combination(N, n)
          if (!isNaN(prob)) result += prob
        }
        for (let i = b; i <= maxX; i++) {
          const prob = (combination(K, i) * combination(N - K, n - i)) / combination(N, n)
          if (!isNaN(prob)) result += prob
        }
        resultText = `P(X ≤ ${a} or X ≥ ${b}) = ${result.toFixed(6)}`
        break
    }

    return { result, resultText }
  }

  // Función para calcular probabilidad normal
  const calculateNormalProbability = (mean: number, std: number, type: string, a: number, b: number) => {
    let result = 0
    let resultText = ""

    switch (type) {
      case "exact":
        result = normalPDF(a, mean, std)
        resultText = `f(${a}) = ${result.toFixed(6)} (densidad)`
        break
      case "atMost":
        result = normalCDF(a, mean, std)
        resultText = `P(X ≤ ${a}) = ${result.toFixed(6)}`
        break
      case "atLeast":
        result = 1 - normalCDF(a, mean, std)
        resultText = `P(X ≥ ${a}) = ${result.toFixed(6)}`
        break
      case "moreThan":
        result = 1 - normalCDF(a, mean, std)
        resultText = `P(X > ${a}) = ${result.toFixed(6)}`
        break
      case "lessThan":
        result = normalCDF(a, mean, std)
        resultText = `P(X < ${a}) = ${result.toFixed(6)}`
        break
      case "between":
        result = normalCDF(b, mean, std) - normalCDF(a, mean, std)
        resultText = `P(${a} ≤ X ≤ ${b}) = ${result.toFixed(6)}`
        break
      case "outside":
        result = normalCDF(a, mean, std) + (1 - normalCDF(b, mean, std))
        resultText = `P(X ≤ ${a} or X ≥ ${b}) = ${result.toFixed(6)}`
        break
    }

    return { result, resultText }
  }

  // Cálculos Binomial
  const calculateBinomial = () => {
    const { result, resultText } = calculateBinomialProbability(
      binomialN,
      binomialP,
      binomialProbType,
      binomialA,
      binomialB,
    )
    setBinomialResult(result)
    setBinomialResultText(resultText)

    const data = []
    for (let i = 0; i <= binomialN; i++) {
      const p = combination(binomialN, i) * Math.pow(binomialP, i) * Math.pow(1 - binomialP, binomialN - i)

      // Determinar si esta barra debe estar sombreada
      let isHighlighted = false
      switch (binomialProbType) {
        case "exact":
          isHighlighted = i === binomialA
          break
        case "atMost":
          isHighlighted = i <= binomialA
          break
        case "atLeast":
          isHighlighted = i >= binomialA
          break
        case "moreThan":
          isHighlighted = i > binomialA
          break
        case "lessThan":
          isHighlighted = i < binomialA
          break
        case "between":
          isHighlighted = i >= binomialA && i <= binomialB
          break
        case "outside":
          isHighlighted = i <= binomialA || i >= binomialB
          break
      }

      data.push({
        x: i,
        probability: p,
        highlighted: isHighlighted ? p : 0,
        normal: !isHighlighted ? p : 0,
      })
    }
    setBinomialData(data)
  }

  // Cálculos Poisson
  const calculatePoisson = () => {
    const { result, resultText } = calculatePoissonProbability(poissonLambda, poissonProbType, poissonA, poissonB)
    setPoissonResult(result)
    setPoissonResultText(resultText)

    const data = []
    for (let i = 0; i <= poissonLambda * 3; i++) {
      const p = (Math.pow(poissonLambda, i) * Math.exp(-poissonLambda)) / factorial(i)

      // Determinar si esta barra debe estar sombreada
      let isHighlighted = false
      switch (poissonProbType) {
        case "exact":
          isHighlighted = i === poissonA
          break
        case "atMost":
          isHighlighted = i <= poissonA
          break
        case "atLeast":
          isHighlighted = i >= poissonA
          break
        case "moreThan":
          isHighlighted = i > poissonA
          break
        case "lessThan":
          isHighlighted = i < poissonA
          break
        case "between":
          isHighlighted = i >= poissonA && i <= poissonB
          break
        case "outside":
          isHighlighted = i <= poissonA || i >= poissonB
          break
      }

      data.push({
        x: i,
        probability: p,
        highlighted: isHighlighted ? p : 0,
        normal: !isHighlighted ? p : 0,
      })
    }
    setPoissonData(data)
  }

  // Cálculos Hipergeométrica
  const calculateHypergeometric = () => {
    const { result, resultText } = calculateHypergeometricProbability(
      hyperN,
      hyperK,
      hyperSampleN,
      hyperProbType,
      hyperA,
      hyperB,
    )
    setHyperResult(result)
    setHyperResultText(resultText)

    const data = []
    const maxX = Math.min(hyperSampleN, hyperK)
    for (let i = 0; i <= maxX; i++) {
      const p =
        (combination(hyperK, i) * combination(hyperN - hyperK, hyperSampleN - i)) / combination(hyperN, hyperSampleN)
      if (!isNaN(p) && p > 0) {
        // Determinar si esta barra debe estar sombreada
        let isHighlighted = false
        switch (hyperProbType) {
          case "exact":
            isHighlighted = i === hyperA
            break
          case "atMost":
            isHighlighted = i <= hyperA
            break
          case "atLeast":
            isHighlighted = i >= hyperA
            break
          case "moreThan":
            isHighlighted = i > hyperA
            break
          case "lessThan":
            isHighlighted = i < hyperA
            break
          case "between":
            isHighlighted = i >= hyperA && i <= hyperB
            break
          case "outside":
            isHighlighted = i <= hyperA || i >= hyperB
            break
        }

        data.push({
          x: i,
          probability: p,
          highlighted: isHighlighted ? p : 0,
          normal: !isHighlighted ? p : 0,
        })
      }
    }
    setHyperData(data)
  }
  // Cálculos Normal
  const calculateNormal = () => {
    const { result, resultText } = calculateNormalProbability(
      normalMean,
      normalStd,
      normalProbType,
      normalA,
      normalB
    )
    setNormalResult(result)
    setNormalResultText(resultText)

    const data = []
    const range = normalStd * 4
    const step = range / 50

    for (let i = normalMean - range; i <= normalMean + range; i += step) {
      const p = normalPDF(i, normalMean, normalStd)
      const x = Number.parseFloat(i.toFixed(2))

      let isHighlighted = false
      switch (normalProbType) {
        case "exact":
          isHighlighted = Math.abs(x - normalA) < step
          break
        case "atMost":
        case "lessThan":
          isHighlighted = x <= normalA
          break
        case "atLeast":
        case "moreThan":
          isHighlighted = x >= normalA
          break
        case "between":
          isHighlighted = x >= normalA && x <= normalB
          break
        case "outside":
          isHighlighted = x <= normalA || x >= normalB
          break
      }

      data.push({
        x,
        probability: p,
        highlighted: isHighlighted ? p : null,  // importante: `null` evita picos en gráfica
        normal: p,
      })
    }

    setNormalData(data)
  }

  // Inicializar cálculos al cargar
  useState(() => {
    calculateBinomial()
    calculatePoisson()
    calculateHypergeometric()
    calculateNormal()
  })

  const needsTwoValues = (type: string) => type === "between" || type === "outside"

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Aplicación de Estadística</h1>
        <p className="text-muted-foreground">Calculadora de distribuciones de probabilidad con gráficos interactivos</p>
      </div>

      <Tabs defaultValue="normal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="binomial">Binomial</TabsTrigger>
          <TabsTrigger value="poisson">Poisson</TabsTrigger>
          <TabsTrigger value="hypergeometric">Hipergeométrica</TabsTrigger>
          <TabsTrigger value="normal">Normal</TabsTrigger>
        </TabsList>

        {/* Distribución Binomial */}
        <TabsContent value="binomial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución Binomial</CardTitle>
                <CardDescription>
                  Calcula diferentes tipos de probabilidades para ensayos independientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="binomial-n">Número de ensayos (n)</Label>
                    <Input
                      id="binomial-n"
                      type="number"
                      value={binomialN}
                      onChange={(e) => setBinomialN(Number.parseInt(e.target.value) || 0)}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="binomial-p">Probabilidad de éxito (p)</Label>
                    <Input
                      id="binomial-p"
                      type="number"
                      value={binomialP}
                      onChange={(e) => setBinomialP(Number.parseFloat(e.target.value) || 0)}
                      min="0"
                      max="1"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="binomial-prob-type">Tipo de probabilidad</Label>
                  <Select value={binomialProbType} onValueChange={setBinomialProbType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {probabilityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={needsTwoValues(binomialProbType) ? "grid grid-cols-2 gap-4" : ""}>
                  <div>
                    <Label htmlFor="binomial-a">Valor a</Label>
                    <Input
                      id="binomial-a"
                      type="number"
                      value={binomialA}
                      onChange={(e) => setBinomialA(Number.parseInt(e.target.value) || 0)}
                      min="0"
                      max={binomialN}
                    />
                  </div>
                  {needsTwoValues(binomialProbType) && (
                    <div>
                      <Label htmlFor="binomial-b">Valor b</Label>
                      <Input
                        id="binomial-b"
                        type="number"
                        value={binomialB}
                        onChange={(e) => setBinomialB(Number.parseInt(e.target.value) || 0)}
                        min={binomialA}
                        max={binomialN}
                      />
                    </div>
                  )}
                </div>

                <Button onClick={calculateBinomial} className="w-full">
                  Calcular
                </Button>
                {binomialResultText && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Resultado:</p>
                    <p className="text-lg font-bold mb-2">{binomialResultText}</p>
                    <div className="space-y-1">
                      <p className="text-xl font-mono text-blue-600">{binomialResult.toFixed(4)}</p>
                      <p className="text-lg font-semibold text-green-600">{(binomialResult * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Distribución Binomial</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    probability: {
                      label: "Probabilidad",
                      color: highlightColors.binomial,
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={binomialData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="normal" fill="#d1d5db" />
                      <Bar dataKey="highlighted" fill={highlightColors.binomial} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribución Poisson */}
        <TabsContent value="poisson">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Poisson</CardTitle>
                <CardDescription>Calcula diferentes tipos de probabilidades para eventos en intervalos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="poisson-lambda">Tasa promedio (λ)</Label>
                  <Input
                    id="poisson-lambda"
                    type="number"
                    value={poissonLambda}
                    onChange={(e) => setPoissonLambda(Number.parseFloat(e.target.value) || 0)}
                    min="0.1"
                    step="0.1"
                  />
                </div>

                <div>
                  <Label htmlFor="poisson-prob-type">Tipo de probabilidad</Label>
                  <Select value={poissonProbType} onValueChange={setPoissonProbType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {probabilityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={needsTwoValues(poissonProbType) ? "grid grid-cols-2 gap-4" : ""}>
                  <div>
                    <Label htmlFor="poisson-a">Valor a</Label>
                    <Input
                      id="poisson-a"
                      type="number"
                      value={poissonA}
                      onChange={(e) => setPoissonA(Number.parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  {needsTwoValues(poissonProbType) && (
                    <div>
                      <Label htmlFor="poisson-b">Valor b</Label>
                      <Input
                        id="poisson-b"
                        type="number"
                        value={poissonB}
                        onChange={(e) => setPoissonB(Number.parseInt(e.target.value) || 0)}
                        min={poissonA}
                      />
                    </div>
                  )}
                </div>

                <Button onClick={calculatePoisson} className="w-full">
                  Calcular
                </Button>
                {poissonResultText && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Resultado:</p>
                    <p className="text-lg font-bold mb-2">{poissonResultText}</p>
                    <div className="space-y-1">
                      <p className="text-xl font-mono text-blue-600">{poissonResult.toFixed(4)}</p>
                      <p className="text-lg font-semibold text-green-600">{(poissonResult * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Distribución de Poisson</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    probability: {
                      label: "Probabilidad",
                      color: highlightColors.poisson,
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={poissonData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="normal" fill="#d1d5db" />
                      <Bar dataKey="highlighted" fill={highlightColors.poisson} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribución Hipergeométrica */}
        <TabsContent value="hypergeometric">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución Hipergeométrica</CardTitle>
                <CardDescription>
                  Calcula diferentes tipos de probabilidades para muestreo sin reemplazo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hyper-N">Población total (N)</Label>
                    <Input
                      id="hyper-N"
                      type="number"
                      value={hyperN}
                      onChange={(e) => setHyperN(Number.parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hyper-K">Éxitos en población (K)</Label>
                    <Input
                      id="hyper-K"
                      type="number"
                      value={hyperK}
                      onChange={(e) => setHyperK(Number.parseInt(e.target.value) || 0)}
                      min="0"
                      max={hyperN}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hyper-n">Tamaño de muestra (n)</Label>
                  <Input
                    id="hyper-n"
                    type="number"
                    value={hyperSampleN}
                    onChange={(e) => setHyperSampleN(Number.parseInt(e.target.value) || 0)}
                    min="1"
                    max={hyperN}
                  />
                </div>

                <div>
                  <Label htmlFor="hyper-prob-type">Tipo de probabilidad</Label>
                  <Select value={hyperProbType} onValueChange={setHyperProbType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {probabilityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={needsTwoValues(hyperProbType) ? "grid grid-cols-2 gap-4" : ""}>
                  <div>
                    <Label htmlFor="hyper-a">Valor a</Label>
                    <Input
                      id="hyper-a"
                      type="number"
                      value={hyperA}
                      onChange={(e) => setHyperA(Number.parseInt(e.target.value) || 0)}
                      min="0"
                      max={Math.min(hyperSampleN, hyperK)}
                    />
                  </div>
                  {needsTwoValues(hyperProbType) && (
                    <div>
                      <Label htmlFor="hyper-b">Valor b</Label>
                      <Input
                        id="hyper-b"
                        type="number"
                        value={hyperB}
                        onChange={(e) => setHyperB(Number.parseInt(e.target.value) || 0)}
                        min={hyperA}
                        max={Math.min(hyperSampleN, hyperK)}
                      />
                    </div>
                  )}
                </div>

                <Button onClick={calculateHypergeometric} className="w-full">
                  Calcular
                </Button>
                {hyperResultText && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Resultado:</p>
                    <p className="text-lg font-bold mb-2">{hyperResultText}</p>
                    <div className="space-y-1">
                      <p className="text-xl font-mono text-blue-600">{hyperResult.toFixed(4)}</p>
                      <p className="text-lg font-semibold text-green-600">{(hyperResult * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Distribución Hipergeométrica</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    probability: {
                      label: "Probabilidad",
                      color: highlightColors.hyper,
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hyperData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="normal" fill="#d1d5db" />
                      <Bar dataKey="highlighted" fill={highlightColors.hyper} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribución Normal */}
        <TabsContent value="normal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución Normal</CardTitle>
                <CardDescription>Calcula diferentes tipos de probabilidades para distribución continua</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="normal-mean">Media (μ)</Label>
                    <Input
                      id="normal-mean"
                      type="number"
                      value={normalMean}
                      onChange={(e) => setNormalMean(Number.parseFloat(e.target.value) || 0)}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="normal-std">Desviación estándar (σ)</Label>
                    <Input
                      id="normal-std"
                      type="number"
                      value={normalStd}
                      onChange={(e) => setNormalStd(Number.parseFloat(e.target.value) || 1)}
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="normal-prob-type">Tipo de probabilidad</Label>
                  <Select value={normalProbType} onValueChange={setNormalProbType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {probabilityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={needsTwoValues(normalProbType) ? "grid grid-cols-2 gap-4" : ""}>
                  <div>
                    <Label htmlFor="normal-a">Valor a</Label>
                    <Input
                      id="normal-a"
                      type="number"
                      value={normalA}
                      onChange={(e) => setNormalA(Number.parseFloat(e.target.value) || 0)}
                      step="0.1"
                    />
                  </div>
                  {needsTwoValues(normalProbType) && (
                    <div>
                      <Label htmlFor="normal-b">Valor b</Label>
                      <Input
                        id="normal-b"
                        type="number"
                        value={normalB}
                        onChange={(e) => setNormalB(Number.parseFloat(e.target.value) || 0)}
                        step="0.1"
                      />
                    </div>
                  )}
                </div>

                <Button onClick={calculateNormal} className="w-full">
                  Calcular
                </Button>
                {normalResultText && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Resultado:</p>
                    <p className="text-lg font-bold mb-2">{normalResultText}</p>
                    <div className="space-y-1">
                      <p className="text-xl font-mono text-blue-600">{normalResult.toFixed(4)}</p>
                      <p className="text-lg font-semibold text-green-600">
                        {normalProbType === "exact"
                          ? `${(normalResult * 100).toFixed(4)}% (densidad)`
                          : `${(normalResult * 100).toFixed(2)}%`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gráfico */}
            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Distribución Normal</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    probability: {
                      label: "Densidad",
                      color: highlightColors.normal,
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={normalData}>
                      <defs>
                        <linearGradient id="highlight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#8884d8" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>

                      {/* Curva normal */}
                      <Area
                        type="monotone"
                        dataKey="normal"
                        stroke="#000"
                        fill="none"
                        strokeWidth={2}
                        dot={false}
                      />

                      {/* Área sombreada */}
                      <Area
                        type="monotone"
                        dataKey="highlighted"
                        stroke="none"
                        fill="url(#highlight)"
                        dot={false}
                        isAnimationActive={false}
                        connectNulls={false}  
                      />

                      <XAxis dataKey="x" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => Number(value).toFixed(6)}
                        labelFormatter={(label) => `x = ${label}`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
