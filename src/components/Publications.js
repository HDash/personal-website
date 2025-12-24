"use client";

import { useEffect, useState } from "react";
import Subheading from "./helpers/Subheading";
import { basicData } from "../data/basic";

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract ORCID ID from the full URL
  const orcidUrl = basicData.links.orcid;
  const orcidId = orcidUrl.split("/").pop();

  useEffect(() => {
    async function fetchPublications() {
      try {
        const response = await fetch(
          `https://pub.orcid.org/v3.0/${orcidId}/works`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch publications");
        }

        const data = await response.json();

        // Extract and format publications
        const works = data.group || [];
        const formattedPublications = works
          .map((work) => {
            const workSummary = work["work-summary"]?.[0];
            if (!workSummary) return null;

            const title = workSummary.title?.title?.value || "Untitled";
            const year = workSummary["publication-date"]?.year?.value || null;
            const type = workSummary.type || null;
            let journal = workSummary["journal-title"]?.value || null;

            // If journal is null and type is "preprint", set journal to "Preprint"
            if (!journal && type === "preprint") {
              journal = "Preprint";
            }

            // Get external URL (DOI preferred)
            let url = null;
            const externalIds =
              workSummary["external-ids"]?.["external-id"] || [];
            const doi = externalIds.find(
              (id) => id["external-id-type"] === "doi"
            );
            if (doi) {
              url = `https://doi.org/${doi["external-id-value"]}`;
            } else if (externalIds.length > 0) {
              url = externalIds[0]["external-id-url"]?.value || null;
            }

            return {
              title,
              year,
              journal,
              type,
              url,
            };
          })
          .filter(Boolean)
          // Sort by year (most recent first)
          .sort((a, b) => (b.year || 0) - (a.year || 0))
          // Take top 5
          .slice(0, 5);

        setPublications(formattedPublications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPublications();
  }, [orcidId]);

  if (loading) {
    return (
      <div>
        <Subheading text="Publications" />
        <div className="text-sm opacity-60">Loading publications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Subheading text="Publications" />
        <div className="text-sm opacity-60">
          Unable to load publications.{" "}
          <a
            href={orcidUrl}
            target="_blank"
            className="underline hover:opacity-60"
          >
            View on ORCID →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Subheading text="Publications" />
      <div className="space-y-3">
        {publications.map((pub, index) => (
          <div key={index} className="flex flex-col">
            {pub.url ? (
              <a
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-semibold opacity-90 hover:opacity-60 flex items-start"
              >
                <span>{pub.title}</span>
                <span className="text-xs opacity-30 ml-1 mt-1">→</span>
              </a>
            ) : (
              <div className="text-base font-semibold opacity-90">
                {pub.title}
              </div>
            )}
            <div className="text-sm opacity-70">
              {[pub.journal, pub.year].filter(Boolean).join(" • ")}
            </div>
          </div>
        ))}
      </div>

      <a
        href={orcidUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center mt-4 text-sm opacity-50 hover:opacity-80 transition-opacity"
      >
        <span>View all on ORCID</span>
        <span className="ml-1">→</span>
      </a>
    </div>
  );
}
