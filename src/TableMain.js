import React, { useState, useEffect } from "react";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";

import RegionRow from "./RegionRow";
import FilterMenu from "./FilterMenu";
import ResetButton from "./ResetButton";

const areCommonElements = (arr1, arr2) => {
  const arr2Set = new Set(arr2);
  return arr1.some((el) => arr2Set.has(el));
};

export default function TableMain({ Regions }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(Regions.map((region) => region));
  const [selectedIndex, setSelectedIndex] = useState(0);

  console.log();

  useEffect(() => {
    if (
      Regions.map((region) =>
        region.name.toLowerCase().includes(query)
      ).includes(true)
    ) {
      setOpen(
        Regions.filter((region) => region.name.toLowerCase().includes(query))
      );
    } else if (
      Regions.map((region) =>
        region.districts.map((district) =>
          district.name.toLowerCase().includes(query)
        )
      )
        .flat()
        .includes(true)
    ) {
      setOpen([
        ...Regions.filter((region) =>
          region.districts
            .map((district) => district)
            .some((district) => district.name.toLowerCase().includes(query))
        ),
        ...Regions.map((region) =>
          region.districts.filter((district) =>
            district.name.toLowerCase().includes(query)
          )
        ).flat(),
      ]);
    } else if (
      Regions.map((region) =>
        region.districts.map((district) =>
          district.townships.map((township) =>
            township.name.toLowerCase().includes(query)
          )
        )
      )
        .flat(2)
        .includes(true)
    ) {
      setOpen([
        ...Regions.filter((region) =>
          region.districts
            .map((district) => district.townships.map((township) => township))
            .flat()
            .some((township) => township.name.toLowerCase().includes(query))
        ),
        ...Regions.map((region) => region.districts.map((district) => district))
          .flat()
          .filter((district) =>
            district.townships
              .map((township) => township)
              .flat(2)
              .some((township) => township.name.toLowerCase().includes(query))
          ),
        ...Regions.map((region) =>
          region.districts.map((district) =>
            district.townships.filter((township) =>
              township.name.toLowerCase().includes(query)
            )
          )
        ).flat(2),
      ]);
    } else {
      return;
    }
  }, [query]);

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    if (index === 0) {
      setOpen(Regions.map((region) => region));
    } else if (index === 1) {
      setOpen([
        ...Regions.map((region) => region),
        ...Regions.map((region) =>
          region.districts.map((district) => district)
        ).flat(),
      ]);
    } else if (index === 2) {
      setOpen([
        ...Regions.map((region) => region),
        ...Regions.map((region) =>
          region.districts.map((district) => district)
        ).flat(),
        ...Regions.map((region) =>
          region.districts.map((district) =>
            district.townships.map((township) => township)
          )
        ).flat(2),
      ]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setQuery(e.target.value);
  };

  const handleOpenClick = (index) => {
    if (
      areCommonElements(open, index) &&
      index.some((item) => item.townships === undefined)
    ) {
      setOpen([...open.filter((item) => !index.some((x) => x.id === item.id))]);
    } else if (
      areCommonElements(open, index) &&
      index.some((item) => item.townships !== undefined)
    ) {
      setOpen([
        ...open.filter(
          (item) =>
            !index.some((x) => x.id === item.id) &&
            !index
              .map((item) => item.townships.map((township) => township))
              .flat(2)
              .some((y) => y.id === item.id)
        ),
      ]);
    } else {
      setOpen([...open, ...index]);
    }
  };

  console.log(open, "open");

  return (
    <TableContainer>
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={handleChange}
      />
      <ResetButton
        open={open}
        setSelectedIndex={setSelectedIndex}
        setOpen={setOpen}
        setQuery={setQuery}
        Regions={Regions}
      />
      <FilterMenu
        selectedIndex={selectedIndex}
        handleMenuItemClick={handleMenuItemClick}
      />
      <Table aria-label="table">
        <TableHead>
          <TableCell>Region</TableCell>
          <TableCell />
          <TableCell>Last Input</TableCell>
          <TableCell>Number of Forms</TableCell>
          <TableCell>Number of Voters</TableCell>
          <TableCell>Update</TableCell>
        </TableHead>
        <TableBody>
          {Regions.map((region) => (
            <RegionRow
              key={region.id}
              region={region}
              query={query}
              open={open}
              handleOpenClick={handleOpenClick}
              areCommonElements={areCommonElements}
              regionStyle={
                areCommonElements(open, [region])
                  ? { display: "table-row" }
                  : !open ||
                    !query ||
                    areCommonElements(
                      open,
                      region.districts.map((district) => district)
                    ) ||
                    areCommonElements(
                      open,
                      region.districts
                        .map((district) =>
                          district.townships.map((township) => township)
                        )
                        .flat(2)
                    )
                  ? { display: "table-row" }
                  : { display: "none" }
              }
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
