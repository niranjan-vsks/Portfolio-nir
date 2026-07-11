"use client";

import { useRouter } from "next/navigation";
import { InfiniteMovingCards } from "@/components/ui/InfiniteMovingCards";

/**
 * About page strips (PRD 11.2, R4 part 2): Infinite Moving terminal-style
 * cards for the experience strip (hover pauses, click routes to /experience)
 * and the previously MISSING skills marquee (click deep-links the matching
 * Mind Map node; skills without a node route to /skills — never a 404).
 */

export interface ExperienceStripItem {
  employer: string;
  title: string;
  tenure: string;
  slug: string;
}

// skill label -> mind-map node id (only verified ids from mindmap-data.json)
export const SKILL_NODE: Record<string, string> = {
  "Agentic Workflows": "skill_agentic_workflows",
  "Multi-Agent Orchestration": "skill_multi_agent",
  LangGraph: "skill_langgraph",
  LangChain: "skill_langchain",
  GraphRAG: "skill_graphrag",
  "Agentic RAG Pipelines": "skill_agentic_rag",
  Neo4j: "skill_neo4j",
  "Hybrid Search": "skill_hybrid_search",
  Reranking: "skill_reranking",
  "MCP Servers": "skill_mcp_servers",
  "LLM Observability": "skill_llm_observability",
  RAGAS: "skill_ragas",
  FastAPI: "skill_fastapi",
  "React 19": "skill_react",
  MongoDB: "skill_mongo",
  PostgreSQL: "skill_postgres",
  Docker: "skill_docker_cicd",
  "System Design": "skill_system_design",
  "Webhook Architecture": "skill_webhook_arch",
  Microservices: "skill_microservices",
  "Forward Deployed Engineering": "domain_fde",
  "Solutions Architecture": "domain_fde",
  "Customer Discovery": "skill_customer_discovery",
  "Production Deployment": "skill_production_deployment",
  "Multi-Tenant Architecture": "skill_multi_tenant_rbac",
  "RBAC Design": "skill_multi_tenant_rbac",
  "Enterprise CRM Integration": "skill_crm_integration",
  "Identity & SSO Architecture": "skill_sso_oauth",
  "OAuth Protocols": "skill_sso_oauth",
  "Tree-Based Ensembles (XGBoost, LightGBM, Random Forest)": "skill_tree_ensembles",
  "Feature Engineering": "skill_feature_eng",
  "Predictive Analytics": "skill_predictive_analytics",
  "Risk Scoring": "skill_risk_scoring",
  "Statistical Modeling": "skill_statistical_modeling",
};

export function AboutStrips({
  experience,
  skills,
}: {
  experience: ExperienceStripItem[];
  skills: { label: string; group: string }[];
}) {
  const router = useRouter();

  return (
    <>
      <section id="experience" className="mt-16 scroll-mt-20">
        <h2 className="mb-5 font-mono text-xl text-green">{"> experience"}</h2>
        <InfiniteMovingCards
          speed={30}
          items={experience.map((e) => ({
            title: e.employer,
            subtitle: `${e.title} · ${e.tenure}`,
            onClick: () => router.push(`/experience#${e.slug}`),
          }))}
        />
        <p className="mt-2 font-mono text-[12px] text-text-dim">
          hover to pause · click a card for the full record
        </p>
      </section>

      <section id="skills" className="mt-16 scroll-mt-20">
        <h2 className="mb-5 font-mono text-xl text-green">{"> skills"}</h2>
        <InfiniteMovingCards
          speed={55}
          items={skills.map((s) => ({
            title: s.label,
            subtitle: SKILL_NODE[s.label] ? `${s.group} · open in mind map` : s.group,
            onClick: () =>
              router.push(
                SKILL_NODE[s.label]
                  ? `/map?node=${encodeURIComponent(SKILL_NODE[s.label])}`
                  : "/skills",
              ),
          }))}
        />
      </section>
    </>
  );
}
