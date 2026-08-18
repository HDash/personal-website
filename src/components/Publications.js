"use client";

import { useEffect, useState } from "react";
import Subheading from "./helpers/Subheading";
import { basicData } from "../data/basic";
import { fetchPublications } from "../lib/publications";

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract ORCID ID from the full URL
  const orcidUrl = basicData.links.orcid;
  const orcidId = orcidUrl.split("/").pop();

  useEffect(() => {
    let cancelled = false;

    fetchPublications({ orcidId, mailto: basicData.email, limit: 5 })
      .then((result) => {
        if (!cancelled) setPublications(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
        {publications.map((pub) => (
          <div key={pub.doi || pub.title} className="flex flex-col">
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
