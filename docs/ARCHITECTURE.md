# CYCLONE-OS: ARCHITECTURE SPECIFICATION

```mermaid
flowchart TD
    subgraph L7[7. User Interface Layer]
        UI[React/Next.js Dashboard]
    end
    subgraph L6[6. Audit & Learning Layer]
        TL[Event Timeline]
        RP[Replay Engine]
    end
    subgraph L5[5. Decision & Operations Simulation Layer]
        ASM[Alert State Machine]
        OS[Operational Simulator]
    end
    subgraph L4[4. Hazard & Impact Layer]
        HF[Hazard Footprint]
        EX[Exposure Engine]
        TTI[Time-to-Impact]
    end
    subgraph L3[3. Forecast & Scenario Layer]
        FR[Forecast Reconciliation]
        SG[Scenario Generation]
    end
    subgraph L2[2. Intelligence Layer]
        CS[Cyclone State]
        SA[Structure Analysis]
        RC[Regime Classification]
        CP[Change Point Detection]
    end
    subgraph L1[1. Data Layer]
        DL[Data Loader & Aligner]
        DB[(Local DB / JSON)]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> L5
    L5 -.-> L6
    L6 -.-> L7
    L7 --> L1
```

## Layer Descriptions & Responsibilities

1. **Data Layer:** Ingestion & temporal alignment of cyclone observations.
2. **Intelligence Layer:** Cyclone state estimation, structure analysis, regime classification, and change point detection.
3. **Forecast & Scenario Layer:** Reconciliation of multi-model NWP guidance and probabilistic scenario generation.
4. **Hazard & Impact Layer:** Parametric wind field modeling, spatial footprint generation, dynamic population exposure calculation, and time-to-impact vectoring.
5. **Decision & Operations Simulation Layer:** Deterministic alert state machine and operational task twin simulation.
6. **Audit & Learning Layer:** Event timeline logger and deterministic replay engine.
7. **User Interface Layer:** Next.js single-pane-of-glass dashboard.
